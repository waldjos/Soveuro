import { BadRequestException, Controller, Post, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { extname } from 'path';

function safeFileName(originalName: string) {
  const base = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
  return base || 'upload';
}

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UploadsController {
  @Post('avatar')
  @ApiOperation({ summary: 'Upload avatar (MVP)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/avatars',
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const ext = extname(file.originalname || '').toLowerCase() || '.png';
          const name = safeFileName(file.originalname || 'avatar');
          cb(null, `${Date.now()}_${name}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const ok = (file.mimetype || '').startsWith('image/');
        cb(null, ok);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('Only image files are allowed');
    const filePath = `/uploads/avatars/${file.filename}`;
    const host = req.headers.host;
    const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? req.protocol ?? 'http';
    const url = host ? `${proto}://${host}${filePath}` : filePath;
    return { path: filePath, url };
  }
}

