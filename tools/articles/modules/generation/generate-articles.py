#!/usr/bin/env python3
"""
Article Generation Script
Main script to generate MDX articles using GPT-4o API.

Usage:
    python generate-articles.py [--batch-size 100] [--overwrite] [--test]
"""

import asyncio
import json
import os
import sys
import re
from datetime import datetime
from typing import List, Dict, Optional

# Modules are now in the same directory
from json_parser import JsonParser
from api_client import APIClient
from file_writer import FileWriter
from internal_links import InternalLinksManager
from youtube_manager import YouTubeManager
from video_metadata import VideoMetadataManager


def extract_youtube_id_from_content(content: str) -> Optional[str]:
    """
    Extract YouTube video ID from MDX content (from VIDEO_ID comment or iframe src).

    Args:
        content: MDX article content

    Returns:
        YouTube video ID or None
    """
    # First, try to extract from VIDEO_ID comment (new format)
    # Example: <!-- VIDEO_ID: FvYNBh3cIHI -->
    pattern_comment = r'<!--\s*VIDEO_ID:\s*([a-zA-Z0-9_-]+)\s*-->'
    match_comment = re.search(pattern_comment, content)

    if match_comment:
        return match_comment.group(1)

    # Fallback: Match iframe with YouTube embed URL (old format)
    # Example: <iframe src="https://www.youtube.com/embed/VIDEO_ID"
    pattern = r'<iframe[^>]+src="https://www\.youtube\.com/embed/([^"?]+)'
    match = re.search(pattern, content)

    if match:
        return match.group(1)

    # Also try youtu.be format
    pattern2 = r'https://youtu\.be/([^"\s?]+)'
    match2 = re.search(pattern2, content)

    if match2:
        return match2.group(1)

    return None


def inject_video_metadata_to_frontmatter(content: str, video_metadata: dict) -> str:
    """
    Insert video metadata into MDX frontmatter.

    Args:
        content: Original MDX content
        video_metadata: Video metadata dictionary

    Returns:
        Updated MDX content with video frontmatter
    """
    # Split content into frontmatter and body
    parts = content.split('---', 2)

    if len(parts) < 3:
        return content  # Invalid frontmatter structure

    frontmatter = parts[1]
    body = parts[2]

    # Build video YAML section
    video_yaml = "\nvideo:\n"
    video_yaml += f"  enabled: {str(video_metadata.get('enabled', True)).lower()}\n"
    video_yaml += f"  youtubeId: \"{video_metadata.get('youtubeId', '')}\"\n"
    video_yaml += f"  title: \"{video_metadata.get('title', '').replace('\"', '\\\"')}\"\n"
    video_yaml += f"  description: \"{video_metadata.get('description', '').replace('\"', '\\\"')}\"\n"
    video_yaml += f"  duration: \"{video_metadata.get('duration', 'PT0S')}\"\n"
    video_yaml += f"  uploadDate: \"{video_metadata.get('uploadDate', '')}\""

    # Insert video section before closing ---
    updated_frontmatter = frontmatter.rstrip() + video_yaml

    # Reconstruct content
    return f"---{updated_frontmatter}\n---{body}"



class ArticleGenerator:
    def __init__(self, config_path: str = 'config.json', priority_range: tuple = None):
        """
        Initialize the article generator.

        Args:
            config_path: Path to configuration file
            priority_range: Optional tuple (min_priority, max_priority) to filter articles
        """
        self.config_path = config_path
        self.priority_range = priority_range
        self.config = None
        self.json_parser = None
        self.api_client = None
        self.file_writer = None
        self.links_manager = None
        self.youtube_manager = None
        self.video_metadata_manager = None
        self.prompt_template = None

    def load_config(self) -> bool:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            print(f"✅ Configuration loaded from {self.config_path}")
            return True
        except Exception as e:
            print(f"❌ Error loading configuration: {str(e)}")
            return False

    def load_prompt_template(self) -> bool:
        """Load prompt template from file."""
        try:
            template_path = 'prompt-template.txt'
            with open(template_path, 'r', encoding='utf-8') as f:
                self.prompt_template = f.read()
            print(f"✅ Prompt template loaded")
            return True
        except Exception as e:
            print(f"❌ Error loading prompt template: {str(e)}")
            return False

    def initialize_modules(self) -> bool:
        """Initialize all modules."""
        try:
            # Initialize JSON parser with priority filter
            self.json_parser = JsonParser(
                self.config['json_file'],
                priority_range=self.priority_range
            )
            if not self.json_parser.load_data():
                return False

            # Display priority statistics
            self.json_parser.print_priority_stats()

            # Validate URL paths (only check format, not categories)
            errors = self.json_parser.validate_url_paths()
            if errors:
                print(f"\n⚠️  Found {len(errors)} URL format errors:")
                for error in errors[:3]:
                    print(f"  - {error}")
                if len(errors) > 3:
                    print(f"  ... and {len(errors) - 3} more")
                print()

            # Initialize API client
            self.api_client = APIClient(self.config)
            print("✅ API client initialized")

            # Initialize file writer
            self.file_writer = FileWriter(
                self.config['output_dir'],
                self.config['site_domain']
            )
            print("✅ File writer initialized")

            # Initialize internal links manager
            self.links_manager = InternalLinksManager(
                self.config['internal_links'],
                self.config['site_domain']
            )
            print("✅ Internal links manager initialized")

            # Initialize YouTube manager
            self.youtube_manager = YouTubeManager(
                self.config['youtube_csv']
            )
            if not self.youtube_manager.load_videos():
                print("⚠️  Warning: Failed to load YouTube videos")
            else:
                print("✅ YouTube manager initialized")

            # Initialize video metadata manager (for video frontmatter)
            if self.config.get('video_feature_enabled', False):
                self.video_metadata_manager = VideoMetadataManager(self.config)
                print("✅ Video metadata manager initialized")
            else:
                print("⏭️  Video metadata feature disabled")

            return True

        except Exception as e:
            print(f"❌ Error initializing modules: {str(e)}")
            return False

    def build_prompt(self, article: Dict) -> str:
        """
        Build prompt for English article generation.

        Args:
            article: Article metadata dictionary

        Returns:
            Complete prompt string
        """
        # Select internal links for this article
        internal_links = self.links_manager.select_links_for_article(
            article['url_path'],
            num_links=2
        )
        formatted_links = self.links_manager.format_links_for_prompt(internal_links)

        # Get YouTube videos list
        youtube_videos = self.youtube_manager.format_videos_list()

        # Get current date
        current_date = datetime.now().strftime('%Y-%m-%d')

        # Build prompt from template (English only)
        prompt = self.prompt_template.format(
            url_path=article['url_path'],
            article_title=article['title'],
            keyword=article['keyword'],
            reference_link=article['reference'] or 'No reference provided',
            internal_links=formatted_links,
            youtube_videos=youtube_videos,
            current_date=current_date
        )

        return prompt

    def inject_video_metadata_to_file(self, file_path: str, locale: str) -> bool:
        """
        Read saved MDX file, extract video ID, and inject video metadata.

        Args:
            file_path: Path to the saved MDX file
            locale: Language code

        Returns:
            bool: True if video metadata was injected, False otherwise
        """
        if not self.video_metadata_manager:
            return False

        try:
            # Read the saved file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract video ID from content
            video_id = extract_youtube_id_from_content(content)

            if not video_id:
                return False  # No video found in content

            # Get cached metadata
            video_metadata = self.video_metadata_manager.get_cached_metadata(video_id)

            if not video_metadata:
                print(f"      ⚠️  Video {video_id} not found in cache")
                return False

            # Inject metadata to frontmatter
            updated_content = inject_video_metadata_to_frontmatter(content, video_metadata)

            # Save updated file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)

            print(f"      ✅ Video metadata added: {video_id}")
            return True

        except Exception as e:
            print(f"      ⚠️  Failed to inject video metadata: {e}")
            return False

    async def generate_all_articles(
        self,
        batch_size: int = 100,
        overwrite: bool = False,
        test_mode: bool = False
    ):
        """
        Generate all articles from Excel file (English only).

        Args:
            batch_size: Number of concurrent API requests
            overwrite: Whether to overwrite existing files
            test_mode: If True, only process first 2 articles
        """
        print("\n" + "=" * 60)
        print("🚀 STARTING ARTICLE GENERATION (English)")
        print("=" * 60 + "\n")

        # Get all articles
        articles = self.json_parser.get_articles()

        if test_mode:
            articles = articles[:2]
            print(f"🧪 TEST MODE: Processing only {len(articles)} articles\n")

        print(f"📝 Total articles to generate: {len(articles)}\n")

        # Build prompts for all articles
        print("🔨 Building prompts...")
        prompts = []
        for article in articles:
            prompt = self.build_prompt(article)
            prompts.append((prompt, article))

        print(f"✅ Built {len(prompts)} prompts\n")

        # Generate articles via API
        print("🤖 Generating articles via GPT-4o API...")
        print(f"   Batch size: {batch_size}")
        print(f"   Concurrent limit: {self.config['concurrent_limit']}")
        print(f"   Max tokens: {self.config['max_tokens']}\n")

        results = await self.api_client.generate_articles_batch(
            prompts,
            batch_size=batch_size
        )

        print("\n💾 Saving generated articles...")

        # Save articles (English only)
        saved_count = 0
        failed_count = 0

        for article_info, content in results:
            if content:
                # Save English article directly
                success = self.file_writer.save_article(
                    content,
                    article_info,
                    overwrite=overwrite,
                    locale='en'
                )
                if success:
                    saved_count += 1
                    # Inject video metadata if feature is enabled
                    if self.video_metadata_manager:
                        category, filename, _ = self.file_writer.extract_category_and_filename(
                            article_info['url_path'],
                            'en'
                        )
                        file_path = os.path.join(
                            self.file_writer.output_dir,
                            'en',
                            category,
                            filename
                        )
                        self.inject_video_metadata_to_file(file_path, 'en')

                    # Remove from failed list if this was a retry
                    self.file_writer.remove_from_failed_list(article_info['url_path'])
                else:
                    failed_count += 1
            else:
                self.file_writer.save_failed_article(
                    article_info,
                    "API generation failed"
                )
                failed_count += 1

        # Print statistics
        print("\n" + "=" * 60)
        print("📊 GENERATION COMPLETE")
        print("=" * 60)

        self.api_client.print_stats()
        self.file_writer.print_stats()
        self.links_manager.print_stats()
        self.youtube_manager.print_stats()

        # Summary
        print("\n" + "=" * 60)
        print("📋 SUMMARY")
        print("=" * 60)
        print(f"Total Articles:       {len(articles)}")
        print(f"Successfully Saved:   {saved_count} ✅")
        print(f"Failed:               {failed_count} ❌")
        if len(articles) > 0:
            print(f"Success Rate:         {round(saved_count / len(articles) * 100, 2)}%")
        print("=" * 60 + "\n")

        if failed_count > 0:
            print(f"ℹ️  Failed articles logged to: tools/articles/logs/failed_articles.log\n")


def parse_priority_range(priority_str: str) -> tuple:
    """
    Parse priority range string.

    Args:
        priority_str: Priority range string like "1-3"

    Returns:
        Tuple of (min_priority, max_priority)
    """
    try:
        parts = priority_str.split('-')
        if len(parts) == 2:
            min_p = int(parts[0])
            max_p = int(parts[1])
            if min_p > max_p:
                raise ValueError("Min priority must be <= max priority")
            return (min_p, max_p)
        else:
            raise ValueError("Invalid format. Use format like '1-3'")
    except Exception as e:
        raise ValueError(f"Invalid priority range '{priority_str}': {str(e)}")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Generate MDX articles using GPT-4o API')
    parser.add_argument(
        '--batch-size',
        type=int,
        default=100,
        help='Number of concurrent API requests (default: 100)'
    )
    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Overwrite existing MDX files'
    )
    parser.add_argument(
        '--test',
        action='store_true',
        help='Test mode: only process first 2 articles'
    )
    parser.add_argument(
        '--priority',
        type=str,
        help='Priority range to filter articles (e.g., "1-2" for priority 1 and 2)'
    )
    parser.add_argument(
        '--retry-failed',
        action='store_true',
        help='Retry only the articles that failed in the last generation'
    )
    parser.add_argument(
        '--clear-failed',
        action='store_true',
        help='Clear the failed articles list and exit'
    )

    args = parser.parse_args()

    # Create generator first (no priority filter for clear/retry operations)
    generator = ArticleGenerator()

    # Load configuration and initialize
    if not generator.load_config():
        sys.exit(1)

    if not generator.load_prompt_template():
        sys.exit(1)

    if not generator.initialize_modules():
        sys.exit(1)

    # Handle --clear-failed option
    if args.clear_failed:
        generator.file_writer.clear_failed_articles()
        print("✅ Failed articles list cleared successfully!")
        sys.exit(0)

    # Handle --retry-failed option
    if args.retry_failed:
        print("\n" + "=" * 60)
        print("🔄 RETRY MODE: Retrying failed articles")
        print("=" * 60 + "\n")

        # Get failed articles from file_writer
        failed_articles = generator.file_writer.get_failed_articles()

        if not failed_articles:
            print("✅ No failed articles found! Nothing to retry.\n")
            sys.exit(0)

        print(f"📝 Found {len(failed_articles)} failed article(s)\n")
        print("Failed articles:")
        for idx, failed in enumerate(failed_articles, 1):
            print(f"  {idx}. {failed['url_path']}")
            print(f"     Title: {failed['title']}")
            print(f"     Error: {failed['error']}")
            print(f"     Time: {failed['timestamp']}\n")

        # Filter articles from JSON based on failed list
        articles_to_retry = generator.json_parser.filter_by_failed_list(failed_articles)

        if not articles_to_retry:
            print("❌ Could not match failed articles with JSON data\n")
            sys.exit(1)

        print(f"✅ Matched {len(articles_to_retry)} article(s) from JSON\n")

        # Override the json_parser's articles with retry list
        original_get_articles = generator.json_parser.get_articles
        generator.json_parser.get_articles = lambda: articles_to_retry

    else:
        # Parse priority range if provided (normal mode)
        priority_range = None
        if args.priority:
            try:
                priority_range = parse_priority_range(args.priority)
                print(f"🎯 Priority filter: {priority_range[0]}-{priority_range[1]}\n")
            except ValueError as e:
                print(f"❌ Error: {str(e)}")
                print("   Example usage: --priority 1-3\n")
                sys.exit(1)

        # Re-create generator with priority filter for normal mode
        if priority_range:
            generator = ArticleGenerator(priority_range=priority_range)
            if not generator.load_config():
                sys.exit(1)
            if not generator.load_prompt_template():
                sys.exit(1)
            if not generator.initialize_modules():
                sys.exit(1)

    # Generate articles
    try:
        asyncio.run(generator.generate_all_articles(
            batch_size=args.batch_size,
            overwrite=args.overwrite,
            test_mode=args.test
        ))
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error during generation: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
