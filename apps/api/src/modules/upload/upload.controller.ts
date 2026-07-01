import { Controller, Post, Query, UseGuards, Req, BadRequestException } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UploadService } from './upload.service'

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  async uploadImage(
    @Req() req: FastifyRequest,
    @Query('folder') folder = 'misc',
  ): Promise<{ url: string }> {
    // @fastify/multipart registrado em main.ts — req.file() disponível em runtime
    const data = await (req as FastifyRequest & { file: () => Promise<MultipartFile | null> }).file()
    if (!data) throw new BadRequestException('Nenhum arquivo enviado')

    const buffer = await data.toBuffer()
    const url = await this.uploadService.uploadFile(
      {
        buffer,
        mimetype: data.mimetype,
        originalname: data.filename ?? 'upload',
        size: buffer.length,
      },
      folder,
    )

    return { url }
  }
}

// Tipo mínimo do @fastify/multipart para evitar dependência de @types/multer
interface MultipartFile {
  filename: string
  mimetype: string
  toBuffer: () => Promise<Buffer>
}
