import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { createMinioService } from './services/minio.server';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { generatePresignedUrl } = createMinioService({
    endPoint: context.cloudflare.env.R2_ENDPOINT,
    accessKey: context.cloudflare.env.R2_ACCESS_KEY,
    secretKey: context.cloudflare.env.R2_SECRET_KEY,
    bucket: 'techtalk',
  });

  const presignedUrl = await generatePresignedUrl(
    'world_populations.parquet',
    60 * 60 * 24 * 7
  );
  const publicUrl =
    'https://pub-9132442479264998b6f4e1a8f3f43943.r2.dev/world_populations.parquet';
  return { presignedUrl, publicUrl };
};

export default function Index() {
  const { presignedUrl, publicUrl } = useLoaderData<typeof loader>();
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({
    presignedUrl: false,
    publicUrl: false,
  });

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState((prev) => ({ ...prev, [key]: false }));
    }, 1000);
  };

  return (
    <div className="p-8 grid grid-cols-1 gap-8">
      <h1 className="text-2xl">DuckDB Wasm R2 Presigned URL Test</h1>

      <div>
        <label
          htmlFor="presigned_url"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Cloudflare R2 Presigned URL (valid for 7 days)
        </label>
        <div className="flex gap-4">
          <input
            id="presigned_url"
            type="text"
            defaultValue={presignedUrl}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(presignedUrl, 'presignedUrl')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {copiedState.presignedUrl ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="public_url"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Public URL
        </label>
        <div className="flex gap-4">
          <input
            id="public_url"
            type="text"
            defaultValue={publicUrl}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(publicUrl, 'publicUrl')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {copiedState.publicUrl ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
