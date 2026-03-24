import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 图片转 WebP 脚本
 * 自动转换 public/images 下的 PNG/JPG 为 WebP 格式
 */

const IMAGE_DIR = join(__dirname, '../public/images');
const QUALITY = 80; // WebP 质量 (1-100)
const SKIP_EXISTING = true; // 跳过已存在的 WebP 文件

// 统计信息
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  compressedSize: 0
};

/**
 * 递归扫描目录
 */
async function* walkDirectory(dir) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      yield* walkDirectory(filePath);
    } else {
      yield filePath;
    }
  }
}

/**
 * 转换单个图片
 */
async function convertImage(inputPath) {
  const ext = extname(inputPath).toLowerCase();

  // 只处理 PNG 和 JPG
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    return;
  }

  const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  // 检查是否已存在
  if (SKIP_EXISTING) {
    try {
      await stat(outputPath);
      console.log(`⏭️  跳过 (已存在): ${basename(inputPath)}`);
      stats.skipped++;
      return;
    } catch {
      // 文件不存在，继续处理
    }
  }

  try {
    // 获取原始文件大小
    const inputStat = await stat(inputPath);
    const originalSize = inputStat.size;

    // 转换为 WebP
    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    // 获取压缩后文件大小
    const outputStat = await stat(outputPath);
    const compressedSize = outputStat.size;

    // 计算压缩率
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    const sizeBefore = (originalSize / 1024).toFixed(1);
    const sizeAfter = (compressedSize / 1024).toFixed(1);

    console.log(
      `✅ ${basename(inputPath)} → ${basename(outputPath)} ` +
      `(${sizeBefore}KB → ${sizeAfter}KB, -${ratio}%)`
    );

    stats.processed++;
    stats.originalSize += originalSize;
    stats.compressedSize += compressedSize;
  } catch (error) {
    console.error(`❌ 转换失败: ${basename(inputPath)}`, error.message);
    stats.errors++;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始转换图片为 WebP 格式...\n');
  console.log(`📁 目录: ${IMAGE_DIR}`);
  console.log(`🎨 质量: ${QUALITY}`);
  console.log(`⏭️  跳过已存在: ${SKIP_EXISTING ? '是' : '否'}\n`);

  const startTime = Date.now();

  // 扫描并转换所有图片
  for await (const filePath of walkDirectory(IMAGE_DIR)) {
    await convertImage(filePath);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalOriginal = (stats.originalSize / 1024 / 1024).toFixed(2);
  const totalCompressed = (stats.compressedSize / 1024 / 1024).toFixed(2);
  const totalRatio = stats.originalSize > 0
    ? ((1 - stats.compressedSize / stats.originalSize) * 100).toFixed(1)
    : 0;

  console.log('\n' + '='.repeat(60));
  console.log('📊 转换完成统计:');
  console.log('='.repeat(60));
  console.log(`✅ 成功转换: ${stats.processed} 个文件`);
  console.log(`⏭️  跳过文件: ${stats.skipped} 个文件`);
  console.log(`❌ 失败文件: ${stats.errors} 个文件`);
  console.log(`📦 原始大小: ${totalOriginal} MB`);
  console.log(`📦 压缩后大小: ${totalCompressed} MB`);
  console.log(`📉 总压缩率: ${totalRatio}%`);
  console.log(`⏱️  耗时: ${duration} 秒`);
  console.log('='.repeat(60));

  if (stats.processed > 0) {
    console.log('\n💡 提示:');
    console.log('1. 检查生成的 WebP 文件质量');
    console.log('2. 更新代码中的图片引用路径');
    console.log('3. 确认后删除原始 PNG/JPG 文件');
    console.log('4. 提交前运行 Lighthouse 验证性能提升');
  }
}

main().catch(console.error);
