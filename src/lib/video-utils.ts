/**
 * 视频工具函数
 * 用于生成 YouTube 视频相关的 URL 和 VideoObject Schema
 */

export interface VideoMetadata {
	enabled: boolean;
	youtubeId: string;
	title: string;
	description: string;
	duration: string; // ISO 8601 格式，如 "PT1M30S"
	uploadDate: string; // ISO 8601 日期格式
	thumbnailUrl?: string; // 可选，默认使用 YouTube 缩略图
	clips?: VideoClip[]; // 可选，用于关键时刻
}

export interface VideoClip {
	name: string;
	startOffset: number; // 秒
	endOffset: number; // 秒
	url?: string; // 可选，跳转 URL
}

export interface VideoObjectSchema {
	"@context": "https://schema.org";
	"@type": "VideoObject";
	name: string;
	description: string;
	thumbnailUrl: string[];
	uploadDate: string;
	duration: string;
	embedUrl: string;
	contentUrl: string;
	hasPart?: VideoClipSchema[];
	potentialAction?: SeekToAction;
}

interface VideoClipSchema {
	"@type": "Clip";
	name: string;
	startOffset: number;
	endOffset: number;
	url: string;
}

interface SeekToAction {
	"@type": "SeekToAction";
	target: string;
	"startOffset-input": string;
}

/**
 * 获取 YouTube 视频缩略图 URL
 * @param videoId - YouTube 视频 ID
 * @param quality - 缩略图质量 (default, hq, mq, sd, maxres)
 * @returns 缩略图 URL
 */
export function getYouTubeThumbnail(
	videoId: string,
	quality: "default" | "hq" | "mq" | "sd" | "maxres" = "maxres",
): string {
	const qualityMap = {
		default: "default.jpg", // 120x90
		mq: "mqdefault.jpg", // 320x180
		hq: "hqdefault.jpg", // 480x360
		sd: "sddefault.jpg", // 640x480
		maxres: "maxresdefault.jpg", // 1280x720+
	};

	return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}`;
}

/**
 * 获取 YouTube 嵌入 URL
 * @param videoId - YouTube 视频 ID
 * @param params - 额外的 URL 参数
 * @returns 嵌入 URL
 */
export function getVideoEmbedUrl(
	videoId: string,
	params?: Record<string, string | number>,
): string {
	const baseUrl = `https://www.youtube.com/embed/${videoId}`;

	if (!params) {
		return baseUrl;
	}

	const queryString = Object.entries(params)
		.map(([key, value]) => `${key}=${value}`)
		.join("&");

	return `${baseUrl}?${queryString}`;
}

/**
 * 获取 YouTube 观看 URL
 * @param videoId - YouTube 视频 ID
 * @returns 观看 URL
 */
export function getVideoContentUrl(videoId: string): string {
	return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * 生成 VideoObject JSON-LD Schema
 * @param video - 视频元数据
 * @param articleUrl - 文章完整 URL
 * @returns VideoObject Schema 对象
 */
export function generateVideoSchema(
	video: VideoMetadata,
	articleUrl: string,
): VideoObjectSchema {
	const thumbnailUrl =
		video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId);

	const schema: VideoObjectSchema = {
		"@context": "https://schema.org",
		"@type": "VideoObject",
		name: video.title,
		description: video.description,
		thumbnailUrl: [thumbnailUrl],
		uploadDate: video.uploadDate,
		duration: video.duration,
		embedUrl: getVideoEmbedUrl(video.youtubeId),
		contentUrl: getVideoContentUrl(video.youtubeId),
	};

	// 添加关键时刻（如果有）
	if (video.clips && video.clips.length > 0) {
		schema.hasPart = video.clips.map((clip) => ({
			"@type": "Clip",
			name: clip.name,
			startOffset: clip.startOffset,
			endOffset: clip.endOffset,
			url: clip.url || `${articleUrl}?t=${clip.startOffset}`,
		}));
	}

	return schema;
}

/**
 * 验证视频元数据是否完整
 * @param video - 视频元数据
 * @returns 验证结果和错误信息
 */
export function validateVideoMetadata(video: VideoMetadata): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!video.youtubeId) {
		errors.push("缺少 youtubeId");
	}

	if (!video.title) {
		errors.push("缺少 title");
	}

	if (!video.description) {
		errors.push("缺少 description");
	}

	if (!video.duration) {
		errors.push("缺少 duration");
	} else if (!isValidISO8601Duration(video.duration)) {
		errors.push("duration 格式不正确，应为 ISO 8601 格式（如 PT1M30S）");
	}

	if (!video.uploadDate) {
		errors.push("缺少 uploadDate");
	} else if (!isValidISO8601Date(video.uploadDate)) {
		errors.push("uploadDate 格式不正确，应为 ISO 8601 日期格式（YYYY-MM-DD）");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * 验证 ISO 8601 时长格式
 * @param duration - 时长字符串
 * @returns 是否有效
 */
function isValidISO8601Duration(duration: string): boolean {
	// 简单验证 PT 开头，包含 H/M/S 中的至少一个
	const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	return regex.test(duration);
}

/**
 * 验证 ISO 8601 日期格式
 * @param date - 日期字符串
 * @returns 是否有效
 */
function isValidISO8601Date(date: string): boolean {
	const regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
	return regex.test(date);
}

/**
 * 将秒数转换为 ISO 8601 时长格式
 * @param seconds - 秒数
 * @returns ISO 8601 时长格式字符串
 */
export function secondsToISO8601Duration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	let duration = "PT";

	if (hours > 0) {
		duration += `${hours}H`;
	}

	if (minutes > 0) {
		duration += `${minutes}M`;
	}

	if (secs > 0 || (hours === 0 && minutes === 0)) {
		duration += `${secs}S`;
	}

	return duration;
}
