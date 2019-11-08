import { get } from 'lodash';
import { insertText } from '@/utils/utils';

function getError (options: Options, xhr: XMLHttpRequest) {
  const msg = `cannot post ${options.action} ${xhr.status}`;
  const err: any = new Error(msg);
  err.status = xhr.status;
  return err;
}

function getBody (xhr: XMLHttpRequest) {
  const text = xhr.responseText || xhr.response;

  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

function isPattern (pattern: string | string[], value: string): boolean {
  if (!pattern) {
    return false;
  }

  if (Array.isArray(pattern)) {
    return pattern.some(item => isPattern(item, value));
  }

  if (pattern === value) {
    return true;
  }

  const regExp = new RegExp(`^${pattern.replace('*', '.*')}`);

  return regExp.test(value);
}

export type THeaders = { [key: string]: any };
export type TData = THeaders | ((file: File) => THeaders);

export interface Options {
  /**
   * 上传地址
   */
  action: string;
  /**
   * 发到后台的文件参数名
   */
  name?: string;
  /**
   * 后台响应的文件地址名称
   */
  jsonName?: string;
  /**
   * Allowed MIME types
   */
  allowedTypes?: string | string[];
  /**
   * 上传中显示内容
   */
  progressText?: string;
  /**
   * 上传所需参数
   */
  data?: TData;
  /**
   * 设置上传的请求头部
   */
  headers?: THeaders;
  /**
   * 上传请求时是否携带 cookie
   */
  withCredentials?: boolean;
  /**
   * 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传
   */
  beforeUpload?: (file: File) => boolean | Promise<void>;
  /**
   * 上传成功事件
   */
  onSuccess?: (response: any, file: File) => any;
  /**
   * 上传失败事件
   */
  onError?: (err: any, response: any, file: File) => any
}

export default class InlineUpload {
  static defaultOptions: Options = {
    action: '',
    name: 'file',
    jsonName: 'fileUrl',
    allowedTypes: 'image/*',
    progressText: '![Uploading file...]()',
    data: {},
    headers: {},
    withCredentials: false,
  };

  options: Options;

  textarea: HTMLTextAreaElement;

  onChange: (text: string) => void;

  lastValue?: string;

  constructor (textarea: HTMLTextAreaElement, onChange: (text: string) => void, options: Options) {
    this.textarea = textarea;
    this.onChange = onChange;
    this.options = { ...InlineUpload.defaultOptions, ...options };
    this.addEvents();
  }

  uploadFiles (files: File[]) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.isFileAllowed(file)) {
        const { beforeUpload } = this.options;

        if (!beforeUpload) {
          this.insertProgressText();
          this.upload(file);
          continue;
        }

        const before = beforeUpload(file);
        if (before instanceof Promise) {
          before.then(() => {
            this.insertProgressText();
            this.upload(file);
          });
        } else if (before !== false) {
          this.insertProgressText();
          this.upload(file);
        }
      }
    }
  }

  upload (file: File) {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();
    const {
      options: {
        action,
        name,
        headers,
        withCredentials,
        onError,
      }
    } = this;

    let { data } = this.options;
    if (typeof data === 'function') {
      // @ts-ignore
      data = data(file);
    }

    if (data) {
      Object.keys(data).map(key => {
        formData.append(key, (data as THeaders)[key]);
      });
    }

    formData.append(name as string, file);

    xhr.onerror = (e: any) => {
      if (onError) {
        onError(e, null, file);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        return this.onUploadSuccess(xhr, file);
      }

      this.onUploadError(xhr, file);
    };

    xhr.open('post', action, true);

    if (withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    for (const h in headers) {
      if (headers.hasOwnProperty(h)) {
        xhr.setRequestHeader(h, headers[h]);
      }
    }

    xhr.send(formData);
  };

  insertProgressText () {
    const { progressText } = this.options;
    this.lastValue = progressText as string;
    const text = insertText(this.textarea, this.lastValue);
    this.onChange(text);
  }

  isFileAllowed (file: File) {
    const { allowedTypes = '*' } = this.options;
    return isPattern(allowedTypes, file.type);
  }

  onUploadSuccess (xhr: XMLHttpRequest, file: File) {
    const { textarea, options: { jsonName, onSuccess }, lastValue, onChange } = this;

    const response = getBody(xhr);
    const fileUrl = get(response, jsonName as string);

    const newValue = `![file](${fileUrl})`;
    console.info(lastValue, textarea.value);
    const text = textarea.value.replace(lastValue as string, newValue);
    textarea.value = text;
    onChange(text);

    if (onSuccess) {
      onSuccess(response, file);
    }
  }

  onUploadError (xhr: XMLHttpRequest, file: File) {
    const { textarea, options: { onError }, lastValue, onChange } = this;

    const text = textarea.value.replace(lastValue as string, '');
    onChange(insertText(textarea, text));

    if (onError) {
      onError(getError(this.options, xhr), getBody(xhr), file);
    }
  }

  onPaste = (e: ClipboardEvent) => {
    const { clipboardData } = e;

    if (clipboardData && typeof clipboardData === 'object') {
      const items = clipboardData.items || clipboardData.files || [];
      const files = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item instanceof DataTransferItem) {
          const file = item.getAsFile();
          if (item.kind !== 'string' && file) {
            files.push(file);
          }
        } else {
          files.push(item as File);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
      }

      this.uploadFiles(files as File[]);
    }
  };

  onDrop = (e: DragEvent | any) => {
    e.preventDefault();
    const { files } = e.dataTransfer;
    this.uploadFiles(files);
  };

  removeEvents () {
    this.textarea.removeEventListener('paste', this.onPaste, false);
    this.textarea.removeEventListener('drop', this.onDrop, false);
  }

  addEvents () {
    this.textarea.addEventListener('paste', this.onPaste, false);
    this.textarea.addEventListener('drop', this.onDrop, false);
  };

  destroy () {
    this.removeEvents();
  }
}
