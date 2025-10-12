// Performance debugging utilities

export function block(ms = 120): void {
  performance.mark('block-start');
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // Intentionally block main thread
  }
  performance.mark('block-end');
  performance.measure('main-thread-block', 'block-start', 'block-end');
}

export function addPerformanceMark(name: string): void {
  performance.mark(name);
}

export function measurePerformance(name: string, startMark: string, endMark?: string): void {
  try {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }
  } catch (error) {
    console.warn(`Failed to measure performance: ${name}`, error);
  }
}

export function injectThirdPartyScript(): void {
  if (document.getElementById('third-party-script')) return;
  
  const script = document.createElement('script');
  script.id = 'third-party-script';
  script.src = '/thirdparty.js';
  script.async = false;
  script.defer = false;
  document.head.appendChild(script);
}

export function removeThirdPartyScript(): void {
  const script = document.getElementById('third-party-script');
  if (script) {
    script.remove();
  }
  
  // Remove banner if it exists
  const banner = document.querySelector('[style*="position: fixed"][style*="top: 0"]');
  if (banner && banner.textContent?.includes('Third-Party Script')) {
    banner.remove();
  }
}

export function loadExtraCSS(): void {
  if (document.getElementById('extra-css')) return;
  
  const link = document.createElement('link');
  link.id = 'extra-css';
  link.rel = 'stylesheet';
  link.href = '/extra.css';
  document.head.appendChild(link);
}

export function removeExtraCSS(): void {
  const link = document.getElementById('extra-css');
  if (link) {
    link.remove();
  }
}

export function addFontPreconnect(): void {
  if (document.querySelector('link[href="https://fonts.gstatic.com"]')) return;
  
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.gstatic.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);
}

export function removeFontPreconnect(): void {
  const link = document.querySelector('link[href="https://fonts.gstatic.com"]');
  if (link) {
    link.remove();
  }
}

export function addHeroPreload(imageSrc: string): void {
  if (document.querySelector(`link[href="${imageSrc}"]`)) return;
  
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = imageSrc;
  document.head.appendChild(preload);
}

export function removeHeroPreload(imageSrc: string): void {
  const link = document.querySelector(`link[href="${imageSrc}"]`);
  if (link) {
    link.remove();
  }
}

export async function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): Promise<(...args: Parameters<T>) => void> {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export function microYield(): Promise<void> {
  return new Promise(resolve => {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(resolve, { priority: 'user-blocking' });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export class WorkerManager {
  private worker: Worker | null = null;
  private taskId = 0;
  private pendingTasks = new Map<number, { resolve: Function; reject: Function }>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.worker = new Worker('/worker.js');
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handleError.bind(this);
      } catch (error) {
        console.warn('Worker not available:', error);
      }
    }
  }

  private handleMessage(e: MessageEvent): void {
    const { taskId, ...result } = e.data;
    const task = this.pendingTasks.get(taskId);
    if (task) {
      task.resolve(result);
      this.pendingTasks.delete(taskId);
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    this.pendingTasks.forEach(task => task.reject(error));
    this.pendingTasks.clear();
  }

  async execute(type: string, payload: any): Promise<any> {
    if (!this.worker) {
      throw new Error('Worker not available');
    }

    const taskId = ++this.taskId;
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(taskId, { resolve, reject });
      this.worker!.postMessage({ type, payload, taskId });
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingTasks.clear();
  }
}

export function addPassiveListeners(element: HTMLElement, events: string[], handler: EventListener): void {
  events.forEach(event => {
    element.addEventListener(event, handler, { passive: true });
  });
}

export function addNonPassiveListeners(element: HTMLElement, events: string[], handler: EventListener): void {
  events.forEach(event => {
    element.addEventListener(event, handler, { passive: false });
  });
}