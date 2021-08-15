import { defineCustomElement } from 'vue';
import TraceViewerComponent from './components/TraceViewer.ce.vue';

const TraceViewer = defineCustomElement(TraceViewerComponent);

// export individual elements
export { TraceViewer };

export function register() {
  customElements.register('trace-viewer', TraceViewer);
}
