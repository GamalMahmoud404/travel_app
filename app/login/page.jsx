import LoginForm from '../components/LoginForm';
import { safeMetadata } from '../lib/metadata';
import SectionHead from '../components/SectionHead';
import { getSessionUser } from '../lib/auth';
import { getSectionCopy, getSite } from '../lib/queries';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy.login.title} — ${site.name}` };
  });
}

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(typeof next === 'string' && next.startsWith('/') ? next : '/account');

  const copy = await getSectionCopy();

  return (
    <section className="container sect auth">
      <SectionHead title={copy.login.title} highlight={copy.login.highlight} sub={copy.login.sub} />
      <LoginForm legend={copy['login.form'].title} next={typeof next === 'string' ? next : ''} />
    </section>
  );
}
