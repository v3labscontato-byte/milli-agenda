import { Injectable, BadRequestException } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { extname } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export interface UploadedFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

@Injectable()
export class UploadService {
  private readonly s3: S3Client

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      region: 'auto',
    })
  }

  async uploadFile(file: UploadedFile, folder: string): Promise<string> {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException(`Tipo não permitido: ${file.mimetype}. Use jpeg, png ou webp.`)
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Arquivo excede o limite de 5MB')
    }

    const ext = extname(file.originalname) || MIME_TO_EXT[file.mimetype] || '.jpg'
    const key = `${folder}/${randomUUID()}${ext}`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: 'milli-uploads',
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    )

    return `${process.env.R2_PUBLIC_URL}/${key}`
  }
}
