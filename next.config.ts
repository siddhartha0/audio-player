import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // point to your custom SW that extends next-pwa's generated one
  customWorkerDir: 'worker', // put your push logic in /worker/index.js
});
