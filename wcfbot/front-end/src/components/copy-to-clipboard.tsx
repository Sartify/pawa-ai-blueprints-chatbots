import { useState, useCallback } from 'react';

interface UseCopyToClipboardOptions {
  timeout?: number;
}

export const useCopyToClipboard = ({ timeout = 2000 }: UseCopyToClipboardOptions = {}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [timeout]);

  return { isCopied, copyToClipboard };
};
