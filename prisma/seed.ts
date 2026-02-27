import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seed...")

  // Créer les catégories d'articles
  const categories = await Promise.all([
    prisma.categorieArticle.upsert({
    where: { id: "cat-outillage" },
    update: {},
    create: {
    id: "cat-outillage",
    nom: "Outillage",
    description: "Outils manuels et électroportatifs"
  }
  }),
    prisma.categorieArticle.upsert({
    where: { id: "cat-consommable" },
    update: {},
    create: {
    id: "cat-consommable",
    nom: "Consommables",
    description: "Matériaux consommables"
  }
  }),
  prisma.categorieArticle.upsert({
    where: { id: "cat-epi" },
    update: {},
    create: {
    id: "cat-epi",
    nom: "EPI",
    description: "Équipements de Protection Individuelle"
  }
  }),
  prisma.categorieArticle.upsert({
    where: { id: "cat-electrique" },
    update: {},
    create: {
    id: "cat-electrique",
    nom: "Matériel Électrique",
    description: "Câbles, connecteurs, composants électriques"
  }
  })
  ])
  console.log(`✅ ${categories.length} catégories créées`)

  // Créer les zones
  const zones = await Promise.all([
    prisma.zone.upsert({
      where: { id: "zone-osbl" },
      update: {},
      create: {
        id: "zone-osbl",
        code: "OSBL",
        nom: "OSBL - Outside Battery Limits",
        description: "Zone OSBL du projet TSP",
        statut: "EN_COURS"
      }
    }),
    prisma.zone.upsert({
      where: { id: "zone-jfc1" },
      update: {},
      create: {
        id: "zone-jfc1",
        code: "JFC1",
        nom: "JFC1 - Junction Field Cable",
        description: "Zone JFC1 du projet TSP",
        statut: "EN_COURS"
      }
    }),
    prisma.zone.upsert({
      where: { id: "zone-mes" },
      update: {},
      create: {
        id: "zone-mes",
        code: "MES",
        nom: "MES - Main Equipment Shelter",
        description: "Zone MES du projet TSP",
        statut: "EN_COURS"
      }
    })
  ])
  console.log(`✅ ${zones.length} zones créées`)

  // Créer l'utilisateur admin
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@sii.fr" },
    update: {},
    create: {
      id: "user-admin",
      email: "admin@sii.fr",
      password: hashedPassword,
      nom: "Admin",
      prenom: "SII",
      role: "ADMIN",
      actif: true
    }
  })
  console.log(`✅ Utilisateur admin créé (email: admin@sii.fr, mot de passe: admin123)`)

  // Créer un chef de projet
  const hashedPassword2 = await bcrypt.hash("chef123", 10)
  
  const chef = await prisma.user.upsert({
    where: { email: "chef@sii.fr" },
    update: {},
    create: {
      id: "user-chef",
      email: "chef@sii.fr",
      password: hashedPassword2,
      nom: "Dupont",
      prenom: "Jean",
      telephone: "+212600000001",
      role: "CHEF_PROJET",
      zoneId: "zone-osbl",
      actif: true
    }
  })
  console.log(`✅ Chef de projet créé (email: chef@sii.fr, mot de passe: chef123)`)

  // Créer quelques agents
  const hashedPassword3 = await bcrypt.hash("agent123", 10)
  
  const agents = await Promise.all([
    prisma.user.upsert({
      where: { email: "agent1@sii.fr" },
      update: {},
      create: {
        id: "user-agent1",
        email: "agent1@sii.fr",
        password: hashedPassword3,
        nom: "Martin",
        prenom: "Pierre",
        telephone: "+212600000002",
        role: "AGENT",
        zoneId: "zone-osbl",
        actif: true
      }
    }),
    prisma.user.upsert({
      where: { email: "agent2@sii.fr" },
      update: {},
      create: {
        id: "user-agent2",
        email: "agent2@sii.fr",
        password: hashedPassword3,
        nom: "Bernard",
        prenom: "Luc",
        telephone: "+212600000003",
        role: "AGENT",
        zoneId: "zone-jfc1",
        actif: true
      }
    }),
    prisma.user.upsert({
      where: { email: "agent3@sii.fr" },
      update: {},
      create: {
        id: "user-agent3",
        email: "agent3@sii.fr",
        password: hashedPassword3,
        nom: "Petit",
        prenom: "Marie",
        telephone: "+212600000004",
        role: "AGENT",
        zoneId: "zone-mes",
        actif: true
      }
    })
  ])
  console.log(`✅ ${agents.length} agents créés`)

  // Créer une équipe
  const equipe = await prisma.equipe.upsert({
    where: { id: "equipe-1" },
    update: {},
    create: {
      id: "equipe-1",
      nom: "Équipe Mécanique OSBL",
      description: "Équipe de maintenance mécanique zone OSBL",
      zoneId: "zone-osbl",
      chefEquipeId: "user-chef"
    }
  })
  console.log(`✅ Équipe créée`)

  // Créer quelques articles
  const articles = await Promise.all([
    prisma.article.upsert({
      where: { id: "article-1" },
      update: {},
      create: {
        id: "article-1",
        code: "OUT-001",
        nom: "Clé à molette",
        description: "Clé à molette 8-19mm",
        unite: "pcs",
        seuilAlerte: 5,
        categorieId: "cat-outillage"
      }
    }),
    prisma.article.upsert({
      where: { id: "article-2" },
      update: {},
      create: {
        id: "article-2",
        code: "OUT-002",
        nom: "Tournevis plat",
        description: "Jeu de tournevis plats",
        unite: "pcs",
        seuilAlerte: 10,
        categorieId: "cat-outillage"
      }
    }),
    prisma.article.upsert({
      where: { id: "article-3" },
      update: {},
      create: {
        id: "article-3",
        code: "EPI-001",
        nom: "Casque de sécurité",
        description: "Casque de protection blanche",
        unite: "pcs",
        seuilAlerte: 3,
        categorieId: "cat-epi"
      }
    }),
    prisma.article.upsert({
      where: { id: "article-4" },
      update: {},
      create: {
        id: "article-4",
        code: "ELEC-001",
        nom: "Câble électrique 2.5mm²",
        description: "Câble électrique souple 2.5mm²",
        unite: "m",
        seuilAlerte: 100,
        categorieId: "cat-electrique"
      }
    })
  ])
  console.log(`✅ ${articles.length} articles créés`)

  // Créer les stocks par zone
  await Promise.all([
    prisma.articleZone.upsert({
      where: { id: "stock-1" },
      update: {},
      create: {
        id: "stock-1",
        articleId: "article-1",
        zoneId: "zone-osbl",
        quantite: 3,
        emplacement: "Armoire A1"
      }
    }),
    prisma.articleZone.upsert({
      where: { id: "stock-2" },
      update: {},
      create: {
        id: "stock-2",
        articleId: "article-2",
        zoneId: "zone-osbl",
        quantite: 15,
        emplacement: "Armoire A1"
      }
    }),
    prisma.articleZone.upsert({
      where: { id: "stock-3" },
      update: {},
      create: {
        id: "stock-3",
        articleId: "article-3",
        zoneId: "zone-osbl",
        quantite: 2,
        emplacement: "Armoire EPI"
      }
    }),
    prisma.articleZone.upsert({
      where: { id: "stock-4" },
      update: {},
      create: {
        id: "stock-4",
        articleId: "article-4",
        zoneId: "zone-jfc1",
        quantite: 50,
        emplacement: "Dépôt câbles"
      }
    })
  ])
  console.log(`✅ Stocks par zone créés`)

  // Créer quelques tâches
  const taches = await Promise.all([
    prisma.tache.create({
      data: {
        titre: "Remplacement câble zone OSBL",
        description: "Remplacer le câble d'alimentation électrique du bâtiment principal",
        type: "ELECTRICITE",
        priorite: "HAUTE",
        statut: "EN_COURS",
        zoneId: "zone-osbl",
        createurId: "user-chef",
        assigneeId: "user-agent1"
      }
    }),
    prisma.tache.create({
      data: {
        titre: "Maintenance pompe hydraulique",
        description: "Révision complète de la pompe hydraulique JFC1",
        type: "MECANIQUE",
        priorite: "NORMALE",
        statut: "A_FAIRE",
        zoneId: "zone-jfc1",
        createurId: "user-chef",
        assigneeId: "user-agent2"
      }
    }),
    prisma.tache.create({
      data: {
        titre: "Installation nouveau panneau",
        description: "Installer le nouveau panneau de contrôle",
        type: "ELECTRICITE",
        priorite: "URGENTE",
        statut: "EN_ATTENTE",
        zoneId: "zone-mes",
        createurId: "user-chef"
      }
    })
  ])
  console.log(`✅ ${taches.length} tâches créées`)

  // Créer quelques pointages du jour
  const today = new Date()
  today.setHours(8, 0, 0, 0)
  
  await Promise.all([
    prisma.pointage.create({
      data: {
        userId: "user-agent1",
        zoneId: "zone-osbl",
        date: today,
        codePointage: "PRESENT",
        heureArrivee: today,
        heuresTravaillees: 8,
        valide: true
      }
    }),
    prisma.pointage.create({
      data: {
        userId: "user-agent2",
        zoneId: "zone-jfc1",
        date: today,
        codePointage: "PRESENT",
        heureArrivee: today,
        heuresTravaillees: 8,
        valide: true
      }
    })
  ])
  console.log(`✅ Pointages de test créés`)

  console.log(`
🎉 Seed terminé avec succès!

📋 Comptes de test créés:
   - Admin: admin@sii.fr / admin123
   - Chef: chef@sii.fr / chef123
   - Agent1: agent1@sii.fr / agent123
   - Agent2: agent2@sii.fr / agent123
   - Agent3: agent3@sii.fr / agent123
  `)
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
