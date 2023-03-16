export async function loader() {
  fetch('https://sesf.vercel.app', {
    method: 'HEAD'
  });
  return new Response('', { status: 200 });
}
