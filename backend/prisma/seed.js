// Seeds reference content (application registry, published lessons and
// practice scenarios, knowledge documents) and — only when
// SEED_DEMO_ACCOUNTS=true — clearly labelled demo accounts.
//
// Idempotent: safe to run repeatedly (upserts by slug/email).
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const content = (name) => JSON.parse(fs.readFileSync(new URL(`./content/${name}.json`, import.meta.url), 'utf8'));

const APPLICATIONS = [
  { slug: 'whatsapp', displayName: 'WhatsApp', category: 'MESSAGING', countryCodes: ['BD', 'IN', 'VN'], currency: null, riskProfile: 'LOW' },
  { slug: 'facebook', displayName: 'Facebook', category: 'SOCIAL', countryCodes: ['BD', 'IN', 'VN'], currency: null, riskProfile: 'LOW' },
  { slug: 'messenger', displayName: 'Messenger', category: 'MESSAGING', countryCodes: ['BD', 'IN', 'VN'], currency: null, riskProfile: 'LOW' },
  { slug: 'gmail', displayName: 'Gmail', category: 'EMAIL', countryCodes: ['BD', 'IN', 'VN'], currency: null, riskProfile: 'MEDIUM' },
  { slug: 'bkash', displayName: 'bKash', category: 'PAYMENT', countryCodes: ['BD'], currency: 'BDT', riskProfile: 'HIGH' },
  { slug: 'nagad', displayName: 'Nagad', category: 'PAYMENT', countryCodes: ['BD'], currency: 'BDT', riskProfile: 'HIGH' },
  { slug: 'momo', displayName: 'MoMo', category: 'PAYMENT', countryCodes: ['VN'], currency: 'VND', riskProfile: 'HIGH' },
  { slug: 'googlepay', displayName: 'Google Pay', category: 'PAYMENT', countryCodes: ['IN'], currency: 'INR', riskProfile: 'HIGH' },
  { slug: 'paypal', displayName: 'PayPal', category: 'PAYMENT', countryCodes: [], currency: 'USD', riskProfile: 'HIGH' },
  { slug: 'booking', displayName: 'Booking.com', category: 'TRAVEL', countryCodes: [], currency: 'USD', riskProfile: 'MEDIUM' },
  { slug: 'practo', displayName: 'Practo', category: 'HEALTHCARE', countryCodes: ['IN'], currency: 'INR', riskProfile: 'MEDIUM' },
  { slug: 'amazon', displayName: 'Amazon', category: 'SHOPPING', countryCodes: ['IN'], currency: 'INR', riskProfile: 'MEDIUM' },
  { slug: 'imo', displayName: 'imo', category: 'MESSAGING', countryCodes: ['BD', 'IN'], currency: null, riskProfile: 'LOW', hasSimulation: true },
];

// V1 tutorial id → app, domain and skill.
const TUTORIAL_META = {
  tut1: { app: 'whatsapp', domain: 'SOCIAL_COMMUNICATION', skill: 'messaging.send_message', slug: 'whatsapp-send-message' },
  tut2: { app: 'whatsapp', domain: 'SOCIAL_COMMUNICATION', skill: 'messaging.share_photo', slug: 'whatsapp-send-photo' },
  tut3: { app: 'whatsapp', domain: 'SOCIAL_COMMUNICATION', skill: 'messaging.video_call', slug: 'whatsapp-video-call' },
  tut4: { app: 'bkash', domain: 'DIGITAL_OPERATIONS', skill: 'payments.send_money', slug: 'bkash-send-money' },
  tut_gp: { app: 'googlepay', domain: 'DIGITAL_OPERATIONS', skill: 'payments.pay_merchant', slug: 'googlepay-pay' },
  tut_amz: { app: 'amazon', domain: 'DIGITAL_OPERATIONS', skill: 'shopping.order_safely', slug: 'amazon-order-safely' },
  tut_prac: { app: 'practo', domain: 'DIGITAL_OPERATIONS', skill: 'health.book_appointment', slug: 'practo-book-doctor' },
  tut_book: { app: 'booking', domain: 'DIGITAL_OPERATIONS', skill: 'travel.book_hotel', slug: 'booking-find-hotel' },
  tut5: { app: null, domain: 'DIGITAL_SAFETY', skill: 'safety.recognise_scam', slug: 'recognise-scam-messages' },
};


// Localised titles carried over from the V1 Learn screen.
const TUTORIAL_TITLES = {
  tut1: { bn: 'WhatsApp মেসেজ পাঠান', hi: 'WhatsApp संदेश भेजें', vi: 'Gửi tin nhắn WhatsApp' },
  tut2: { bn: 'WhatsApp-এ ছবি পাঠান', hi: 'WhatsApp पर फोटो भेजें', vi: 'Gửi ảnh trên WhatsApp' },
  tut3: { bn: 'ভিডিও কল করুন', hi: 'वीडियो कॉल करें', vi: 'Gọi video' },
  tut4: { bn: 'bKash-এ নিরাপদে টাকা পাঠান', hi: 'bKash से सुरक्षित पैसे भेजें', vi: 'Chuyển tiền an toàn bằng bKash' },
  tut_gp: { bn: 'Google Pay দিয়ে পেমেন্ট করুন', hi: 'Google Pay से भुगतान करें', vi: 'Thanh toán bằng Google Pay' },
  tut_amz: { bn: 'Amazon-এ নিরাপদে অর্ডার করুন', hi: 'Amazon पर सुरक्षित ऑर्डर करें', vi: 'Đặt hàng an toàn trên Amazon' },
  tut_prac: { bn: 'অনলাইনে ডাক্তার বুক করুন', hi: 'ऑनलाइन डॉक्टर बुक करें', vi: 'Đặt lịch bác sĩ trực tuyến' },
  tut_book: { bn: 'নিরাপদ হোটেল খুঁজুন', hi: 'सुरक्षित होटल खोजें', vi: 'Tìm khách sạn an toàn' },
  tut5: { bn: 'স্ক্যাম মেসেজ চিনুন', hi: 'स्कैम संदेश पहचानें', vi: 'Nhận biết tin nhắn lừa đảo' },
};

// V1 practice task id → skill.
const TASK_SKILL = {
  wa1: 'messaging.send_message', wa2: 'messaging.video_call', wa3: 'messaging.share_document',
  fb1: 'social.react_post', fb2: 'privacy.post_audience', fb3: 'social.save_post', fb4: 'safety.report_scam',
  gm1: 'email.read', gm2: 'safety.report_scam',
  bk1: 'payments.check_balance', bk2: 'payments.profile', bk3: 'payments.recharge', bk4: 'payments.pay_bill', bk5: 'payments.savings', bk6: 'payments.send_money',
  ng1: 'safety.otp_scam', mm1: 'payments.pay_merchant', mm2: 'safety.otp_scam',
  gp1: 'payments.pay_merchant', gp2: 'payments.send_money', pp1: 'payments.send_money',
  bo1: 'travel.search_hotel', bo2: 'travel.check_reviews', pr1: 'health.book_appointment',
  am1: 'shopping.search', am2: 'shopping.order_safely',
};
const TASK_APP = { googlepay: 'googlepay' };
const LEVEL = { Beginner: 'BEGINNER', Intermediate: 'INTERMEDIATE', Advanced: 'ADVANCED' };

// steps: { en: [...], bn: [...] } → [{ en, bn }, ...]
function zipSteps(steps) {
  const langs = Object.keys(steps);
  const n = Math.max(...langs.map((l) => steps[l].length));
  return Array.from({ length: n }, (_, i) => Object.fromEntries(langs.filter((l) => steps[l][i]).map((l) => [l, steps[l][i].trim()])));
}

async function seedApplications() {
  const ids = {};
  for (const { hasSimulation = true, ...app } of APPLICATIONS) {
    const row = await prisma.application.upsert({
      where: { slug: app.slug },
      create: { ...app, supportedLanguages: ['en', 'bn', 'hi', 'vi'], hasSimulation },
      update: { displayName: app.displayName, category: app.category, countryCodes: app.countryCodes, currency: app.currency, riskProfile: app.riskProfile, hasSimulation },
    });
    ids[app.slug] = row.id;
  }
  return ids;
}

async function upsertLesson(lesson, steps) {
  const data = { ...lesson, status: 'PUBLISHED', publishedAt: new Date() };
  const row = await prisma.lesson.upsert({ where: { slug: lesson.slug }, create: data, update: data });
  await prisma.lessonStep.deleteMany({ where: { lessonId: row.id } });
  await prisma.lessonStep.createMany({ data: steps.map((body, order) => ({ lessonId: row.id, order, body })) });
  return row;
}

async function seedLessons(appIds) {
  const tutorials = content('tutorials');
  // Everyday-app lessons (all four languages) replace the V1 tutorials that
  // share their slug; the V1 ones only had English and Bengali.
  const everyday = content('everyday_lessons');
  const replaced = new Set(everyday.map((l) => l.slug));
  let sortOrder = 0;
  const lessons = [];
  for (const [category, list] of Object.entries(tutorials)) {
    for (const t of list) {
      const meta = TUTORIAL_META[t.id];
      if (!meta || replaced.has(meta.slug)) continue;
      const steps = zipSteps(t.steps);
      lessons.push(await upsertLesson({
        slug: meta.slug,
        applicationId: meta.app ? appIds[meta.app] : null,
        domain: meta.domain,
        category,
        difficulty: LEVEL[t.level] || 'BEGINNER',
        estimatedMinutes: Number.parseInt(t.duration, 10) || 5,
        skillKey: meta.skill,
        title: { en: t.title, ...(TUTORIAL_TITLES[t.id] || {}) },
        description: { en: steps[0]?.en || t.title, ...(steps[0]?.bn ? { bn: steps[0].bn } : {}) },
        sortOrder: sortOrder++,
      }, steps));
    }
  }
  for (const extra of [...everyday, ...content('app_lessons'), ...content('extra_lessons')]) {
    const { steps, applicationSlug, ...rest } = extra;
    lessons.push(await upsertLesson({ ...rest, applicationId: applicationSlug ? appIds[applicationSlug] : null, sortOrder: sortOrder++ }, steps));
  }
  return lessons;
}

// Guided practice in all four languages. Each step names the simulator
// action that completes it, so the practice app can check the learner
// really did the step. Apps listed here replace their V1 tasks entirely.
async function seedGuidedScenarios(appIds) {
  const guided = content('practice_scenarios');
  let count = 0;
  for (const [appSlug, list] of Object.entries(guided)) {
    if (!appIds[appSlug]) continue;
    const keep = [];
    for (const sc of list) {
      const data = {
        slug: `${appSlug}-${sc.id}`,
        applicationId: appIds[appSlug],
        skillKey: sc.skill,
        title: sc.title,
        difficulty: sc.level || 'BEGINNER',
        status: 'PUBLISHED',
      };
      const row = await prisma.scenario.upsert({ where: { slug: data.slug }, create: data, update: data });
      await prisma.scenarioStep.deleteMany({ where: { scenarioId: row.id } });
      await prisma.scenarioStep.createMany({
        data: sc.steps.map((st, order) => ({
          scenarioId: row.id,
          order,
          instruction: st.text,
          expectedAction: st.expect,
          hint: st.hint ?? undefined,
          riskLevel: /pin|otp|send money|transfer|pay/i.test(st.text.en || '') ? 'HIGH' : 'LOW',
        })),
      });
      keep.push(data.slug);
      count += 1;
    }
    // Older practice for this app is retired, not deleted (history stays valid).
    await prisma.scenario.updateMany({ where: { applicationId: appIds[appSlug], slug: { notIn: keep } }, data: { status: 'ARCHIVED' } });
  }
  return { count, apps: new Set(Object.keys(guided)) };
}

async function seedScenarios(appIds) {
  const tasks = content('practice_tasks');
  const guided = await seedGuidedScenarios(appIds);
  let count = guided.count;
  for (const [appKey, list] of Object.entries(tasks)) {
    const appSlug = TASK_APP[appKey] || appKey;
    if (!appIds[appSlug] || guided.apps.has(appSlug)) continue;
    for (const task of list) {
      const title = { en: task.title, ...(task.titleBn ? { bn: task.titleBn } : {}), ...(task.titleHi ? { hi: task.titleHi } : {}) };
      const data = {
        slug: `${appSlug}-${task.id}`,
        applicationId: appIds[appSlug],
        skillKey: TASK_SKILL[task.id] || `${appSlug}.practice`,
        title,
        difficulty: LEVEL[task.level] || 'BEGINNER',
        status: 'PUBLISHED',
      };
      const row = await prisma.scenario.upsert({ where: { slug: data.slug }, create: data, update: data });
      await prisma.scenarioStep.deleteMany({ where: { scenarioId: row.id } });
      await prisma.scenarioStep.createMany({
        data: zipSteps(task.steps).map((instruction, order) => ({
          scenarioId: row.id,
          order,
          instruction,
          riskLevel: /pin|otp|send money|pay|টাকা|पैसे/i.test(instruction.en || '') ? 'HIGH' : 'LOW',
        })),
      });
      count += 1;
    }
  }
  return count;
}

// Every published lesson becomes a VERIFIED_GUIDIA knowledge document per
// language it exists in, chunked by step, so the assistant can ground
// answers in reviewed content.
async function seedKnowledge(lessons) {
  let docs = 0;
  for (const lesson of lessons) {
    const steps = await prisma.lessonStep.findMany({ where: { lessonId: lesson.id }, orderBy: { order: 'asc' } });
    const app = lesson.applicationId ? await prisma.application.findUnique({ where: { id: lesson.applicationId } }) : null;
    for (const language of ['en', 'bn', 'hi', 'vi']) {
      const title = lesson.title[language];
      const bodies = steps.map((s) => s.body[language]).filter(Boolean);
      if (!title || bodies.length !== steps.length) continue;
      const body = bodies.map((b, i) => `${i + 1}. ${b}`).join('\n');
      const doc = await prisma.knowledgeDocument.upsert({
        where: { slug_language_version: { slug: lesson.slug, language, version: 1 } },
        create: { slug: lesson.slug, language, title, body, applicationSlug: app?.slug ?? null, sourceType: 'VERIFIED_GUIDIA', source: `lesson:${lesson.slug}`, status: 'PUBLISHED', publishedAt: new Date() },
        update: { title, body, status: 'PUBLISHED' },
      });
      await prisma.knowledgeChunk.deleteMany({ where: { documentId: doc.id } });
      await prisma.knowledgeChunk.createMany({ data: bodies.map((content_, ordinal) => ({ documentId: doc.id, ordinal, content: `${title}: ${content_}` })) });
      docs += 1;
    }
  }
  return docs;
}

async function seedUser({ email, password, fullName, role, language = 'en' }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { fullName, email, passwordHash, role, preferredLanguage: language, preference: { create: { onboardingDone: true } } },
  });
}

async function seedDemoAccounts() {
  // Demo credentials are for local development and judged demos only. They
  // are documented in README and never created unless explicitly enabled.
  const senior = await seedUser({ email: 'demo@guidia.app', password: 'Demo1234', fullName: 'Demo Senior (Demo)', role: 'SENIOR', language: 'bn' });
  const guardian = await seedUser({ email: 'guardian@guidia.app', password: 'Guardian1234', fullName: 'Demo Guardian (Demo)', role: 'GUARDIAN' });
  await seedUser({ email: 'admin@guidia.app', password: 'Admin1234', fullName: 'Admin (Demo)', role: 'ADMIN' });

  const existing = await prisma.guardianRelationship.findFirst({ where: { seniorUserId: senior.id, guardianUserId: guardian.id } });
  if (!existing) {
    await prisma.guardianRelationship.create({
      data: {
        seniorUserId: senior.id,
        guardianUserId: guardian.id,
        guardianEmail: guardian.email,
        status: 'ACTIVE',
        respondedAt: new Date(),
        approvalThreshold: 100_000, // ৳1,000 in paisa
        permissions: { create: ['EMERGENCY_ALERTS', 'APPROVAL_REQUESTS', 'SAFETY_ALERTS', 'LEARNING_PROGRESS'].map((scope) => ({ scope })) },
      },
    });
  }
  return { senior: senior.email, guardian: guardian.email };
}

async function main() {
  const appIds = await seedApplications();
  const lessons = await seedLessons(appIds);
  const scenarios = await seedScenarios(appIds);
  const docs = await seedKnowledge(lessons);
  console.log(`Seeded ${Object.keys(appIds).length} applications, ${lessons.length} lessons, ${scenarios} scenarios, ${docs} knowledge documents.`);

  if (process.env.SEED_DEMO_ACCOUNTS === 'true') {
    const demo = await seedDemoAccounts();
    console.log(`Demo accounts ready: ${demo.senior} / Demo1234, ${demo.guardian} / Guardian1234, admin@guidia.app / Admin1234`);
  } else {
    console.log('Demo accounts skipped (set SEED_DEMO_ACCOUNTS=true to create them).');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
