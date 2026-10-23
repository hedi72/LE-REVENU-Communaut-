import type { Core } from '@strapi/strapi';
import { seedReference } from './seed-reference';

export const categories = [
  ['Bourse', 'bourse', 'Actions, marchés et stratégies d’investissement.'],
  ['Placements', 'placements', 'Échangez sur les placements et la diversification.'],
  ['Assurance-vie', 'assurance-vie', 'Contrats, fonds en euros et unités de compte.'],
  ['Immobilier', 'immobilier', 'Investissement locatif, SCPI et patrimoine immobilier.'],
  ['Impôts', 'impots', 'Fiscalité, déclarations et optimisation.'],
  ['Retraite', 'retraite', 'Préparez votre retraite et échangez sur le PER.'],
  ['Transmission', 'transmission', 'Donation, succession et protection de vos proches.'],
  ['Épargne', 'epargne', 'Constituez une épargne adaptée à vos projets.'],
  ['Vie pratique', 'vie-pratique', 'Budget, banque et finances au quotidien.'],
  ['Débuter', 'debuter', 'Vos premiers pas pour investir en confiance.'],
  ['Le café des lecteurs', 'cafe-des-lecteurs', 'Faisons connaissance et partageons nos idées.'],
] as const;

const examples = [
  [
    'PEA : quels ETF choisir pour commencer en 2026 ?',
    'Je souhaite ouvrir un PEA et investir progressivement 200 euros par mois. Comment avez-vous choisi vos premiers ETF ? Je cherche surtout à comprendre vos critères de diversification et de frais.',
    'bourse',
    'question',
  ],
  [
    'Assurance-vie : comment répartissez-vous votre épargne ?',
    'Entre fonds en euros et unités de compte, il est parfois difficile de trouver le bon équilibre. Partageons nos approches et les questions à poser avant de choisir un contrat.',
    'assurance-vie',
    'discussion',
  ],
  [
    'SCPI : vos retours après une première année',
    'J’aimerais recueillir des retours d’expérience sur la gestion, les frais et les délais de versement. Quels points auriez-vous aimé connaître avant de vous lancer ?',
    'immobilier',
    'question',
  ],
  [
    'PER ou assurance-vie pour préparer la retraite ?',
    'Je prépare ma retraite à un horizon de quinze ans. Comment comparez-vous la disponibilité de l’épargne, les frais et la fiscalité de ces deux enveloppes ?',
    'retraite',
    'question',
  ],
  [
    'Vos habitudes pour mieux suivre votre budget',
    'Depuis quelques mois, je prends un moment chaque semaine pour suivre mon budget. Quelles méthodes simples utilisez-vous pour garder une vue d’ensemble ?',
    'vie-pratique',
    'discussion',
  ],
  [
    'Donation aux enfants : par où commencer ?',
    'Nous souhaitons anticiper la transmission de notre patrimoine. Quels documents et quelles questions préparer avant un premier rendez-vous chez le notaire ?',
    'transmission',
    'question',
  ],
  [
    'Constituer son épargne de précaution pas à pas',
    'Avant de commencer à investir, je souhaite mettre de côté une réserve disponible. Comment avez-vous défini un montant adapté à votre situation ?',
    'epargne',
    'question',
  ],
  [
    'Bienvenue : présentez-vous à la communauté !',
    'Bienvenue dans la communauté des lecteurs du Revenu ! Quel sujet vous intéresse le plus ? Partagez votre parcours et ce que vous aimeriez apprendre ici.',
    'cafe-des-lecteurs',
    'discussion',
  ],
  [
    'Déclaration de revenus : comment vous organisez-vous ?',
    'Je souhaite mieux organiser mes justificatifs tout au long de l’année. Avez-vous des astuces pour préparer votre déclaration sans rien oublier ?',
    'impots',
    'discussion',
  ],
  [
    'Diversification : comment définir ses objectifs ?',
    'Avant de choisir des placements, comment avez-vous clarifié votre horizon de placement, vos projets et votre tolérance au risque ?',
    'placements',
    'question',
  ],
  [
    'Premier investissement : quelles erreurs éviter ?',
    'Je débute et souhaite prendre le temps d’apprendre. Quelles lectures et quelles bonnes habitudes vous ont été les plus utiles au départ ?',
    'debuter',
    'question',
  ],
  [
    'Investissement régulier : partageons nos méthodes',
    'Investir à intervalles réguliers m’aide à garder une approche disciplinée. Comment vous organisez-vous et comment réévaluez-vous vos objectifs ?',
    'bourse',
    'discussion',
  ],
  [
    'Comparer les frais de ses contrats d’assurance-vie',
    'Frais d’entrée, de gestion et d’arbitrage : quels éléments regardez-vous en premier pour comparer les contrats ? Je souhaite construire une grille simple.',
    'assurance-vie',
    'question',
  ],
  [
    'Location : préparer son premier projet immobilier',
    'Quels points vérifiez-vous avant d’étudier un investissement locatif ? J’aimerais échanger sur le budget prévisionnel et les charges à anticiper.',
    'immobilier',
    'discussion',
  ],
] as const;

export async function configurePermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query('plugin::users-permissions.role');
  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');
  const reads = [
    'api::community.community.find',
    'api::category.category.find',
    'api::discussion.discussion.find',
    'api::discussion.discussion.findOne',
    'api::reply.reply.find',
  ];
  for (const type of ['public', 'authenticated']) {
    const role = await roleQuery.findOne({ where: { type } });
    if (!role) throw new Error(`Rôle Strapi manquant : ${type}`);
    const allowed = [
      ...reads,
      ...(type === 'authenticated'
        ? [
            'api::discussion.discussion.create',
            'api::reply.reply.create',
            'plugin::users-permissions.user.me',
          ]
        : []),
    ];
    // Enforce least privilege, including after a local admin changes permissions.
    const managed = ['api::category.category.', 'api::discussion.discussion.', 'api::reply.reply.'];
    const existing = await permissionQuery.findMany({ where: { role: role.id } });
    for (const permission of existing) {
      if (
        managed.some((prefix) => permission.action.startsWith(prefix)) &&
        !allowed.includes(permission.action)
      ) {
        await permissionQuery.delete({ where: { id: permission.id } });
      }
    }
    for (const action of allowed) {
      const exists = await permissionQuery.findOne({ where: { action, role: role.id } });
      if (!exists) await permissionQuery.create({ data: { action, role: role.id } });
    }
  }
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const advanced = ((await store.get({ key: 'advanced' })) as Record<string, unknown>) || {};
  await store.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
}

export async function seedDemo(strapi: Core.Strapi) {
  if (process.env.SEED_DEMO !== 'true') return;
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_IN_PRODUCTION !== 'true') {
    throw new Error(
      'Données de démonstration interdites en production sans ALLOW_DEMO_IN_PRODUCTION=true.',
    );
  }
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 12)
    throw new Error('DEMO_PASSWORD doit contenir au moins 12 caractères. Lancez npm run setup.');
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });
  const users = [];
  for (const [username, email] of [
    ['Camille Martin', 'camille@example.com'],
    ['Thomas Bernard', 'thomas@example.com'],
  ]) {
    let user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email } });
    if (!user)
      user = await strapi.plugin('users-permissions').service('user').add({
        username,
        email,
        password,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
    users.push(user);
  }
  const categoryIds = new Map<string, string>();
  for (const [name, slug, description] of categories) {
    let category = await strapi
      .documents('api::category.category')
      .findFirst({ filters: { slug } });
    if (!category)
      category = await strapi
        .documents('api::category.category')
        .create({ data: { name, slug, description } });
    categoryIds.set(slug, category.documentId);
  }
  for (const [index, [title, content, slug, type]] of examples.entries()) {
    const categoryId = categoryIds.get(slug);
    if (!categoryId) throw new Error(`Catégorie de démonstration manquante : ${slug}`);
    let discussion = await strapi
      .documents('api::discussion.discussion')
      .findFirst({ filters: { title } });
    if (!discussion) {
      discussion = await strapi.documents('api::discussion.discussion').create({
        data: { title, content, category: categoryId, author: users[index % 2].id, type },
      });
      if (index < 5)
        await strapi.documents('api::reply.reply').create({
          data: {
            content:
              'Merci pour cette question ! Pour ma part, j’ai commencé par préciser mes objectifs et comparer les frais. Les articles du Revenu m’ont aidé à préparer les questions à poser à mon conseiller.',
            author: users[(index + 1) % 2].id,
            discussion: discussion.documentId,
          },
        });
    }
  }
  strapi.log.info(
    'Données de démonstration disponibles (camille@example.com et thomas@example.com).',
  );
  await seedReference(strapi);
}
