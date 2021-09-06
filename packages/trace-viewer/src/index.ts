import { defineCustomElement } from 'vue';
import TraceViewerCmp from './components/TraceViewer.ce.vue';

export const TraceViewer = defineCustomElement(TraceViewerCmp);

export function registerTraceViewer(): void {
  customElements.define('trace-viewer', TraceViewer);
}
