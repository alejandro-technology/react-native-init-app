export interface DownloadOptions {
  projectName: string;
  branch?: string;
  onProgress?: (message: string) => void;
}

export interface DownloadResult {
  success: boolean;
  tempDir: string;
  templatePath: string;
  error?: string;
}

export interface ITemplateRepository {
  download(options: DownloadOptions): Promise<DownloadResult>;
  cleanup(tempDir: string): Promise<void>;
}
