import prisma from '../src/lib/prisma';
import slugify from 'slugify';

async function main() {
  const quizzes = await prisma.quiz.findMany({ where: { slug: '' } });
  let updated = 0;
  for (const quiz of quizzes) {
    let baseSlug = slugify(quiz.title || 'untitled-quiz', { lower: true, strict: true });
    let slug = baseSlug;
    let i = 1;
    // Ensure uniqueness
    while (await prisma.quiz.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }
    await prisma.quiz.update({ where: { id: quiz.id }, data: { slug } });
    updated++;
    console.log(`Updated quiz ${quiz.id} with slug: ${slug}`);
  }
  console.log(`Backfill complete. Updated ${updated} quizzes.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 