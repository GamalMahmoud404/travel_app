import { redirect } from 'next/navigation';
import { safeMetadata } from '../lib/metadata';
import RegisterForm from '../components/RegisterForm';
import SectionHead from '../components/SectionHead';
import { getSessionUser } from '../lib/auth';
import { getSectionCopy, getSite } from '../lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy.register.title} — ${site.name}` };
  });
}

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;
  if (await getSessionUser()) redirect('/account');

  const copy = await getSectionCopy();

  return (
    <section className="container sect auth">
      <SectionHead
        title={copy.register.title}
        highlight={copy.register.highlight}
        sub={copy.register.sub}
      />
      <RegisterForm
        legend={copy['register.form'].title}
        next={typeof next === 'string' ? next : ''}
      />
    </section>
  );
}
