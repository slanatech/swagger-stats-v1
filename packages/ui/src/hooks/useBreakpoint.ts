import { onMounted, reactive } from 'vue';
import { pathOr } from 'ramda';

import resolveConfig from 'tailwindcss/resolveConfig';
// @ts-ignore
import * as tailwindConfig from 'tailwind.config.js';
const fullTailwindConfig = resolveConfig(tailwindConfig);

const screens = {
  sm: parseInt(pathOr('640', ['theme', 'screens', 'sm'], fullTailwindConfig)),
  md: parseInt(pathOr('768', ['theme', 'screens', 'md'], fullTailwindConfig)),
  lg: parseInt(pathOr('1024', ['theme', 'screens', 'lg'], fullTailwindConfig)),
  xl: parseInt(pathOr('1280', ['theme', 'screens', 'lg'], fullTailwindConfig)),
};

const breakpoints = reactive({ w: 0, h: 0, is: 'sm' });

const sm = (val: number) => val >= screens.sm && val < screens.md;
const md = (val: number) => val >= screens.md && val < screens.lg;
const lg = (val: number) => val >= screens.lg && val < screens.xl;
const xl = (val: number) => val >= screens.xl;

const getBreakpoint = (w: number) => {
  if (sm(w)) return 'sm';
  else if (md(w)) return 'md';
  else if (lg(w)) return 'lg';
  else if (xl(w)) return 'xl';
  else return 'xs';
};

const setBreakpoint = () => {
  breakpoints.w = window.innerWidth;
  breakpoints.h = window.innerHeight;
  breakpoints.is = getBreakpoint(window.innerWidth);
};

const useBreakpoint = () => {
  onMounted(() => {
    setBreakpoint();
    window.addEventListener('resize', () => {
      setBreakpoint();
      //console.log(`Screens2: ${JSON.stringify(screens2)}`);
    });
  });

  return {
    breakpoints,
  };
};

export default useBreakpoint;
