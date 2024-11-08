import * as Minio from 'minio';

export const createMinioService = ({
  endPoint,
  accessKey,
  secretKey,
  bucket,
}: {
  endPoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}) => {
  const minioClient = new Minio.Client({
    endPoint,
    region: 'auto',
    useSSL: true,
    accessKey,
    secretKey,
  });

  const generatePresignedUrl = async (key: string, expires = 3600) => {
    return await minioClient.presignedUrl('GET', bucket, key, expires);
  };

  return { generatePresignedUrl };
};
