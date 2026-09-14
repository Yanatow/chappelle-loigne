/* ═══════════════════════════════════════════════════════════
   Chapelle du Viaulnay — données des fresques
   C est ICI que se gère le contenu du site. Chaque fresque :
     photo             photo de la fresque (à gauche sur le détail)
     photo_restored    photo restaurée / restituée (à droite sur le détail)
     preview_offset    cadrage vertical de la prévisualisation en galerie :
                       0 = haut de la photo, 50 = centre, 100 = bas
     titre             titre affiché sur la card et l écran de détail
     descriptionCourte sous-titre de la card et de l écran de détail
     descriptionLongue texte du parchemin à droite des deux photos
     son               (optionnel) commentaire audio lancé à l ouverture
                       du détail, ex. "sound/image7.mp3". Sans ce champ
                       la fresque est silencieuse et les boutons son sont
                       masqués (de même si le fichier est introuvable).
   L écran d introduction (entre l accueil et la galerie) se gère
   dans le tableau « intro » : une entrée par partie, chacune avec
     titre      titre affiché en haut de l écran
     sousTitre  sous-titre sous le titre
     images     liste des photos de la mosaïque, dans l ordre ;
                un couple [ "a.jpg", "b.jpg" ] affiche les deux photos
                côte à côte, toujours sur la même ligne
   Au clic, une photo de la mosaïque s ouvre en grand (fenêtre
   refermable par ✕, Échap ou un clic à côté).
   L écran de clôture (après la dernière fresque du versant sud) se
   gère dans l objet « outro » :
     titre      titre affiché en haut de l écran
     sousTitre  sous-titre sous le titre
     images     les deux photos affichées côte à côte, chacune avec
                { src, legende } (legende affichée sous la photo)
     titreTexte titre en tête du parchemin
     texte      paragraphes du parchemin, dans l ordre
     signature  ligne finale, en italique, alignée à droite
   L ordre des entrées est l ordre d affichage. Ce fichier est du
   JSON enrobé d une affectation JavaScript, pour fonctionner sans
   serveur HTTP (ouverture d index.html par double-clic).
   ═══════════════════════════════════════════════════════════ */

const FRESQUES_DATA = {
  intro: [
    {
      titre: "1 - Restauration",
      sousTitre:
        "La chapelle Notre Dame de Pitié lors de notre arrivée en 1990",
      images: [
        "introduction/1/image001.jpg",
        "introduction/1/image003.jpg",
        "introduction/1/image005.jpg",
        "introduction/1/image007.jpg",
        "introduction/1/image009.jpg",
        "introduction/1/image011.jpg",
        "introduction/1/image013.jpg",
        "introduction/1/image015.jpg",
        "introduction/1/image017.jpg",
        "introduction/1/image019.jpg",
      ],
    },
    {
      titre: "2 - Historique",
      sousTitre:
        "Depuis de nombreuses années, François Mauguy, propriétaire du manoir du Viaulnay et de ses terres, souffre de la maladie de la goutte.",
      images: [
        "introduction/2/image021.jpg",
        "introduction/2/image023.jpg",
        "introduction/2/image025.jpg",
        "introduction/2/2731.png",
        "introduction/2/image033.jpg",
      ],
    },
    {
      titre: "3 - Les beaux arts et le monde",
      sousTitre:
        "Le ministère de la Culture en fait l’acquisition le 10 juin 1896 et va l’exposer dans plusieurs salons.",
      images: [
        "introduction/3/image035.jpg",
        "introduction/3/image037.jpg",
        "introduction/3/3941.png",
        "introduction/3/4345.png",
      ],
    },
  ],
  nord: [
    {
      photo: "nord/1.jpg",
      photo_restored: "nord_restored/1.mp4",
      preview_offset: 30,
      titre: "Jésus au Jardin des Oliviers",
      descriptionCourte: "Panneau 1 · La Passion du Christ",
      descriptionLongue:
        "Après l'institution de l'eucharistie, Jésus part prier au mont des Oliviers, invitant Pierre, Jacques et Jean à être près de lui ; mais les trois disciples se laissent écraser de sommeil. À genoux, il prie : « Père, si tu veux, éloigne de moi cette coupe ; que ce ne soit pas ma volonté qui se fasse, mais la tienne. » Un ange du ciel le réconforte ; dans l'angoisse, sa sueur devient comme des gouttes de sang.",
    },
    {
      photo: "nord/2.jpg",
      photo_restored: "nord_restored/2.mp4",
      son: "sound/image2.mp3",
      preview_offset: 50,
      titre: "Jésus devant les autorités juives",
      descriptionCourte: "Panneau 2 · La Passion du Christ",
      descriptionLongue:
        "Cette scène représente Jésus devant les autorités juives. Certains d'entre les chefs décident de le condamner : son enseignement est considéré comme dangereux et, surtout, Jésus se dit Dieu — ce qui est inaudible pour eux.",
    },
    {
      photo: "nord/3.jpg",
      photo_restored: "nord_restored/3.mp4",
      preview_offset: 10,
      titre: "Pilate",
      descriptionCourte: "Panneau 3 · La Passion du Christ",
      descriptionLongue:
        "Ce panneau donne à voir Pilate, l'autorité romaine qui occupe le pays. C'est devant lui que Jésus, condamné par les chefs juifs, va être conduit.",
    },
    {
      photo: "nord/4.jpg",
      photo_restored: "nord_restored/4.mp4",
      son: "sound/image4.mp3",
      preview_offset: 10,
      titre: "Ecce Homo",
      descriptionCourte: "Panneau 4 · La Passion du Christ",
      descriptionLongue:
        "La scène montre Jésus après qu'il a été flagellé. « Ecce Homo » — « Voici l'homme » —, dira Pilate en le voyant ainsi. On lui a mis sur les épaules un manteau rouge de soldat ; en guise de couronne, des épines sont attachées sur sa tête et, au lieu d'un sceptre royal, on place dans sa main un roseau.",
    },
    {
      photo: "nord/5.jpg",
      photo_restored: "nord_restored/5.mp4",
      preview_offset: 50,
      titre: "Jésus devant Pilate",
      descriptionCourte: "Panneau 5 · La Passion du Christ",
      descriptionLongue:
        "Ce panneau représente Jésus devant Pilate. Ne trouvant rien à lui reprocher, Pilate le livrera tout de même aux autorités juives et s'en lavera les mains, comme cela est représenté.",
    },
    {
      photo: "nord/6.jpg",
      photo_restored: "nord_restored/6.mp4",
      son: "sound/image6.mp3",
      preview_offset: 10,
      titre: "Le prophète Isaïe",
      descriptionCourte: "Panneau 6 · L'annonce de la croix",
      descriptionLongue:
        "La scène montre un personnage : le prophète Isaïe, qui annonce la mort de Jésus sur la croix. Sa présence parmi les scènes de la Passion rappelle que cette mort accomplit les Écritures.",
    },
    {
      photo: "nord/7.jpg",
      photo_restored: "nord_restored/7.mp4",
      preview_offset: 30,
      titre: "Le portement de croix",
      descriptionCourte: "Panneau 7 · La Passion du Christ",
      descriptionLongue:
        "Sur ce panneau et le suivant, on voit Jésus porter sa croix, aidé en cela par Simon de Cyrène — ville de Libye —, personne réquisitionnée à cet effet, qui soulage Jésus épuisé par les souffrances endurées.",
    },
    {
      photo: "nord/8.jpg",
      photo_restored: "nord_restored/8.mp4",
      preview_offset: 30,
      titre: "Simon de Cyrène",
      descriptionCourte: "Panneau 8 · La Passion du Christ",
      descriptionLongue:
        "Suite du portement de croix : Simon de Cyrène, réquisitionné par les soldats, aide Jésus à porter sa croix et le soulage des souffrances endurées. Originaire de Cyrène, en Libye, il est le passant que les Évangiles associent pour toujours à ce chemin.",
    },
    {
      photo: "nord/9.jpg",
      photo_restored: "nord_restored/9.mp4",
      preview_offset: 30,
      titre: "Saint Jean-Baptiste",
      descriptionCourte: "Panneau 9 · Le précurseur",
      descriptionLongue:
        "Le dernier panneau de ce registre représente saint Jean-Baptiste, le cousin de Jésus, qui a annoncé sa venue et baptisé dans le Jourdain.",
    },
    {
      photo: "nord/10.jpg",
      photo_restored: "nord_restored/10.mp4",
      son: "sound/image10.mp3",
      preview_offset: 20,
      titre: "Saint Jean l'Évangéliste",
      descriptionCourte: "Panneau 10 · Les quatre évangélistes",
      descriptionLongue:
        "Sur les panneaux du registre supérieur, en partant de l'autel, sont données à voir des personnes qui ont constitué le corpus de la foi catholique et de la théologie chrétienne — d'abord les quatre évangélistes, qui nous ont raconté la vie de Jésus. Le premier est saint Jean, saint patron des écrivains, représenté par un aigle.",
    },
    {
      photo: "nord/11.jpg",
      photo_restored: "nord_restored/11.mp4",
      son: "sound/image11.mp3",
      preview_offset: 20,
      titre: "Saint Marc",
      descriptionCourte: "Panneau 11 · Les quatre évangélistes",
      descriptionLongue:
        "Deuxième des quatre évangélistes figurés au registre supérieur, saint Marc, saint patron des notaires, est représenté par un lion.",
    },
    {
      photo: "nord/12.jpg",
      photo_restored: "nord_restored/12.mp4",
      son: "sound/image12.mp3",
      preview_offset: 15,
      titre: "Saint Luc",
      descriptionCourte: "Panneau 12 · Les quatre évangélistes",
      descriptionLongue:
        "Saint Luc, saint patron des médecins, est représenté par un taureau.",
    },
    {
      photo: "nord/13.jpg",
      photo_restored: "nord_restored/13.mp4",
      son: "sound/image13.mp3",
      preview_offset: 25,
      titre: "Saint Matthieu",
      descriptionCourte: "Panneau 13 · Les quatre évangélistes",
      descriptionLongue:
        "Saint Matthieu, saint patron des douaniers, est représenté par un ange à tête d'homme. Avec Jean, Marc et Luc, il clôt la série des quatre évangélistes qui nous ont raconté la vie de Jésus.",
    },
    {
      photo: "nord/14.jpg",
      photo_restored: "nord_restored/14.mp4",
      son: "sound/image14.mp3",
      preview_offset: 25,
      titre: "Saint Grégoire",
      descriptionCourte: "Panneau 14 · Pères de l'Église latine",
      descriptionLongue:
        "Viennent ensuite quatre théologiens, appelés aussi les Pères de l'Église latine. Leurs écrits — la littérature patristique —, leurs actes et leur exemple moral ont contribué à établir et à défendre la doctrine chrétienne, avec une influence considérable sur leur temps et les générations suivantes. Le premier d'entre eux ici est saint Grégoire, saint patron des musiciens, pour avoir mis en vigueur le chant grégorien.",
    },
    {
      photo: "nord/15.jpg",
      photo_restored: "nord_restored/15.mp4",
      son: "sound/image15.mp3",
      preview_offset: 30,
      titre: "Saint Augustin",
      descriptionCourte: "Panneau 15 · Pères de l'Église latine",
      descriptionLongue:
        "Saint Augustin est le saint patron des imprimeurs, car il a beaucoup écrit — son livre le plus connu est intitulé « Les Confessions ». On lui doit cette parole : « Notre cœur est sans repos, tant qu'il ne demeure en toi. »",
    },
    {
      photo: "nord/16.jpg",
      photo_restored: "nord_restored/16.mp4",
      son: "sound/image16.mp3",
      preview_offset: 30,
      titre: "Saint Ambroise",
      descriptionCourte: "Panneau 16 · Pères de l'Église latine",
      descriptionLongue:
        "Saint Ambroise est le saint patron des apiculteurs, car de sa bouche sortaient des paroles de « miel ».",
    },
    {
      photo: "nord/17.jpg",
      photo_restored: "nord_restored/17.mp4",
      son: "sound/image17.mp3",
      preview_offset: 30,
      titre: "Saint Jérôme",
      descriptionCourte: "Panneau 17 · Pères de l'Église latine",
      descriptionLongue:
        "Saint Jérôme (347-419) a traduit la Bible pour la première fois en latin, à partir des textes en hébreu et en grec anciens. Cette traduction, appelée la Vulgate, est toujours le texte officiel en cours à Rome ; à ce titre, il est le saint patron des traducteurs. On lui doit ces paroles : « Ignorer l'Écriture, c'est ignorer le Christ. » « Si tu pries, tu parles avec l'Époux ; si tu lis, c'est lui qui te parle. »",
    },
    {
      photo: "nord/18.jpg",
      photo_restored: "nord_restored/18.mp4",
      son: "sound/image18.mp3",
      preview_offset: 10,
      titre: "Saint Paul",
      descriptionCourte: "Panneau 18 · L'apôtre des nations",
      descriptionLongue:
        "Le dernier panneau représente saint Paul, dont la conversion radicale s'est réalisée entre Jérusalem et Damas. Persécuteur des premiers chrétiens devenu l'exemple des missionnaires, il a enseigné de la Turquie à Rome sans mesurer sa peine ni les dangers. On le représente petit, avec une épée — citoyen romain, il ne pouvait mourir autrement — et debout, seul de la série, signe de son rôle actif d'évangélisateur.",
    },
  ],
  sud: [
    {
      photo: "sud/19.jpg",
      photo_restored: "sud_restored/19.mp4",
      preview_offset: 50,
      titre: "Ève au jardin d'Éden",
      descriptionCourte: "Panneau 19 · La Genèse",
      descriptionLongue:
        "Ce panneau représentait Ève au jardin d'Éden ; il ne reste rien de la scène, sinon cette représentation qui nous est parvenue. Par le péché, Adam et Ève ont pensé que le « non » à Dieu était le sommet de la liberté, la plénitude de l'être. La première scène du versant nord, Jésus au mont des Oliviers, ramène la volonté humaine à un « oui » total à Dieu : c'est cela qui nous rachète définitivement.",
    },
    {
      photo: "sud/20.jpg",
      photo_restored: "sud_restored/20.mp4",
      preview_offset: 50,
      titre: "La fuite en Égypte",
      descriptionCourte: "Panneau 20 · L'enfance du Christ",
      descriptionLongue:
        "Sur ce panneau et le suivant, Joseph et Marie, juchée sur un âne, obéissent à l'ordre divin et fuient en Égypte pour éviter la colère du roi Hérode, qui fit tuer tous les enfants mâles nés dans la même période que Jésus.",
    },
    {
      photo: "sud/21.jpg",
      photo_restored: "sud_restored/21.mp4",
      preview_offset: 50,
      titre: "La fuite en Égypte (suite)",
      descriptionCourte: "Panneau 21 · L'enfance du Christ",
      descriptionLongue:
        "Suite de la fuite en Égypte : guidée par l'ordre divin, la Sainte Famille poursuit sa route loin du massacre des Innocents ordonné par le roi Hérode.",
    },
    {
      photo: "sud/22.jpg",
      photo_restored: "sud_restored/22.mp4",
      preview_offset: 50,
      titre: "La sibylle Europa",
      descriptionCourte: "Panneau 22 · La prophétesse",
      descriptionLongue:
        "La sibylle Europa porte un glaive évoquant le massacre des Innocents et, par association, la fuite en Égypte. Dès le IIIe siècle av. J.-C. circulent en Méditerranée des livres connus sous le nom d'Oracles sibyllins, mêlant oracles antiques, oracles juifs et écrits chrétiens : les premiers chrétiens se sont peu à peu emparés de la sibylle et ont intégré sa prophétie dans leur littérature religieuse.",
    },
    {
      photo: "sud/23.jpg",
      photo_restored: "sud_restored/23.mp4",
      preview_offset: 20,
      titre: "Saint Blaise",
      descriptionCourte: "Panneau 23 · Le martyr de Sébaste",
      descriptionLongue:
        "Saint Blaise est montré attaché à un poteau, la chair lacérée par les instruments de son supplice — les deux peignes de fer représentés en bas du tableau. Médecin puis évêque de Sébaste, en Arménie, guérisseur des âmes et des corps, il fut arrêté en 316 sur ordre de l'empereur Licinius. Rien ne le faisant renoncer à sa foi, il fut battu, déchiré par les peignes, puis décapité.",
    },
    {
      photo: "sud/24.jpg",
      photo_restored: "sud_restored/24.mp4",
      preview_offset: 50,
      titre: "Les marchands chassés du Temple",
      descriptionCourte: "Panneau 24 · La vie publique du Christ",
      descriptionLongue:
        "Sur ce panneau et le suivant, Jésus chasse les marchands du Temple : le Temple de Jérusalem, dit-il, est la maison de Dieu et non pas un repaire de marchands.",
    },
    {
      photo: "sud/25.jpg",
      photo_restored: "sud_restored/25.mp4",
      preview_offset: 60,
      titre: "La purification du Temple",
      descriptionCourte: "Panneau 25 · La vie publique du Christ",
      descriptionLongue:
        "Suite de la scène précédente : Jésus purifie le Temple de Jérusalem — la maison de Dieu, et non un repaire de marchands.",
    },
    {
      photo: "sud/28.jpg",
      photo_restored: "sud_restored/28.mp4",
      preview_offset: 20,
      titre: "François Mauguy, le fondateur",
      descriptionCourte: "Panneau 28 · Le fondateur de la chapelle",
      descriptionLongue:
        "Première scène de la rangée du haut, presque entièrement disparue : le fondateur, François Mauguy, s'y est fait représenter implorant la miséricorde divine. Sur le cartouche est écrit : « Mon Dieu, des grands travaux faits en ce lieu, si tu veux bien avoir santé de ma goutte. » Le dessin de la scène a été retrouvé dans une archive.",
    },
    {
      photo: "sud/29.jpg",
      photo_restored: "sud_restored/29.mp4",
      preview_offset: 50,
      titre: "La paille et la poutre",
      descriptionCourte: "Panneau 29 · La parabole",
      descriptionLongue:
        "Ce panneau représente la parabole de la paille et de la poutre : « Pourquoi vois-tu la paille dans l'œil de ton frère, alors que la poutre dans ton œil à toi, tu ne la remarques pas ? »",
    },
    {
      photo: "sud/30.jpg",
      photo_restored: "sud_restored/30.mp4",
      preview_offset: 30,
      titre: "La tentation du Christ",
      descriptionCourte: "Panneau 30 · Le carême",
      descriptionLongue:
        "Sur ce panneau et le suivant, Jésus, au sortir de quarante jours de jeûne — le carême —, rencontre le démon qui le tente : il lui présente du pain, des richesses, des maisons, le pouvoir symbolisé par le temple. « Si tu m'adores, je te donne tout cela », lui dit-il. Jésus lui répond que l'homme vit essentiellement de la parole de Dieu et non des richesses du monde.",
    },
    {
      photo: "sud/31.jpg",
      photo_restored: "sud_restored/31.mp4",
      preview_offset: 30,
      titre: "La tentation du Christ (suite)",
      descriptionCourte: "Panneau 31 · Le carême",
      descriptionLongue:
        "Suite de la tentation du Christ : à toutes les offres du démon — le pain, les richesses, le pouvoir —, Jésus oppose la même réponse : l'homme vit essentiellement de la parole de Dieu, et non des richesses du monde.",
    },
    {
      photo: "sud/32.jpg",
      photo_restored: "sud_restored/32.mp4",
      preview_offset: 35,
      titre: "Les trois amis dans la fournaise",
      descriptionCourte: "Panneau 32 · L'Ancien Testament",
      descriptionLongue:
        "Schadrac, Méschac et Abed-Nego, les trois amis de Daniel, refusent d'adorer la statue d'or de Nabuchodonosor : « Notre Dieu peut nous délivrer de la fournaise ardente. » Furieux, le roi fait chauffer la fournaise sept fois plus et les y fait jeter, liés. Effrayé, il s'écrie alors : « Je vois quatre hommes sans liens qui marchent au milieu du feu, et la figure du quatrième ressemble à celle d'un fils de Dieu. »",
    },
    {
      photo: "sud/33.jpg",
      photo_restored: "sud_restored/33.mp4",
      preview_offset: 35,
      titre: "Daniel dans la fosse aux lions",
      descriptionCourte: "Panneau 33 · L'Ancien Testament",
      descriptionLongue:
        "Déporté adolescent à Babylone, Daniel gagne par sa sagesse la confiance de Nabuchodonosor, dont il interprète les songes, puis celle du roi mède Darius après la chute de Babylone. Tombé en disgrâce par la faute de ses ennemis, il est jeté en pâture aux lions ; fidèle à sa foi, il échappe miraculeusement au supplice et se voit gracié. On lui attribue aussi d'avoir sauvé l'honneur de Suzanne, injustement accusée.",
    },
    {
      photo: "sud/34.jpg",
      photo_restored: "sud_restored/34.mp4",
      preview_offset: 35,
      titre: "Le sacrifice d'Abraham",
      descriptionCourte: "Panneau 34 · L'Ancien Testament",
      descriptionLongue:
        "Dieu demande à Abraham d'offrir son fils Isaac en holocauste sur le mont Moriah. Après trois jours de marche, Abraham élève un autel, dispose les bûches et lie son fils. Alors qu'il tend la main pour immoler Isaac, un ange lui crie d'épargner l'enfant : un bélier pris au piège dans un fourré est sacrifié à sa place. L'ange bénit Abraham et promet que toutes les nations de la terre se béniront en sa descendance.",
    },
    {
      photo: "sud/35.jpg",
      photo_restored: "sud_restored/35.mp4",
      preview_offset: 35,
      titre: "Job sur son fumier",
      descriptionCourte: "Panneau 35 · L'Ancien Testament",
      descriptionLongue:
        "Job est dévêtu, assis sur un tas de fumier ; au-dessus de lui, le démon le frappe de la lèpre, et à sa droite sa femme lui parle. Patriarche étranger à Israël, Job est le type du juste : « intègre, droit, craignant Dieu et éloigné du mal ». Privé de tous ses biens puis frappé dans sa chair, il ne maudit pas Dieu — son amour est sans calcul : « Nous recevons le bien de Dieu, et nous ne recevrions pas aussi le mal ? »",
    },
  ],

  outro: {
    titre: "Prière des pèlerins",
    sousTitre: "Chapelle du Viaulnay · Notre-Dame de Pitié",
    images: [{ src: "outro/jeanne2.jpg" }, { src: "outro/jeanne.jpeg" }],
    titreTexte:
      "Prière des pèlerins de la chapelle du Viaulnay à Notre-Dame de Pitié",
    texte: [
      "Dans cette chapelle du Viaulnay, nous vous prions, Notre-Dame de Pitié.",
      "Ô notre Mère, ô Mère du Verbe incarné, vos larmes ne cessent de couler sur les plaies du corps de votre Fils blessé. Vous qui avez souffert Sept Douleurs qui chacune, comme une épée, ont transpercé votre Cœur Immaculé, vous, la Vierge très compatissante, tournez vers nous votre regard plein de pitié. Prenez soin de nos blessures, suppléez par vos grâces à nos fragilités, et portez vous-même à Jésus, votre Enfant bien aimé, les prières que nous sommes venus vous confier. Mais surtout, Mère tout éplorée, apprenez nous à aimer Dieu dans nos croix d’ici bas, comme vous l’avez fait jusqu’aux pieds de votre Fils crucifié pour nous, jusqu’au tombeau du Sauveur de l’Humanité. Apprenez nous à Le remercier, à Lui faire confiance, en tout, pour tout, sans retour. Apprenez nous à nous abandonner à Son Cœur Sacré.",
      "Que par votre puissante intercession, Notre Seigneur nous accorde la grâce de faire seulement Sa Volonté, dans toutes nos épreuves et difficultés. Que par Sa Croix et par vos larmes, nous soyons tous sauvés.",
      "Merci, ô miséricordieuse Vierge Marie, car déjà nous nous savons exaucés.",
      "Amen.",
    ],
    signature:
      "Sœur Jeanne, Ordre de la Visitation Sainte-Marie (Jeanne Pelat)",
  },
};
