import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User, Kavita, Comment } from './models/index.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing database collections...');

    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {
      await User.deleteMany({});
      await Kavita.deleteMany({});
      await Comment.deleteMany({});
    }

    console.log('👑 Seeding Super Admin & System Accounts...');

    // 1. Super Admin: Praveen (Main platform governor)
    const praveenSuperAdmin = await User.create({
      name: 'Praveen (Super Admin)',
      email: 'praveen.pr105@gmail.com',
      password: 'praveen@2020',
      role: 'superadmin',
      penName: 'महाप्रबंधक',
      bio: 'Chief custodian & platform guardian of Mukt Kavya poetry archives and heritage classical vault.',
      languages: ['Hindi', 'English', 'Sanskrit', 'Urdu'],
    });

    const superAdmin = await User.create({
      name: 'Mukt Kavya Pradhan (Super Admin)',
      email: 'superadmin@muktkavya.com',
      password: 'password',
      role: 'superadmin',
      penName: 'महाप्रबंधक',
      bio: 'Platform administration & heritage classical poet curator.',
      languages: ['Hindi', 'English', 'Sanskrit', 'Urdu'],
    });

    // 2. Content Director
    const admin = await User.create({
      name: 'Aditya Sen (Content Director)',
      email: 'admin@muktkavya.com',
      password: 'password',
      role: 'admin',
      penName: 'काव्य-सम्पादक',
      bio: 'Senior editor and multilingual literary curator at Mukt Kavya.',
      languages: ['Hindi', 'Bengali', 'English'],
    });

    // 3. Reader Account
    const reader = await User.create({
      name: 'काव्य रसिक (Avid Reader)',
      email: 'reader@muktkavya.com',
      password: 'password',
      role: 'reader',
      penName: 'रसिक',
      bio: 'Devoted reader and patron of classical and contemporary regional verses.',
      languages: ['Hindi', 'English', 'Urdu', 'Gujarati'],
    });

    console.log('🏛️ Seeding Classical & Heritage Poets (Maintained Exclusively by Super Admin)...');

    // Heritage Poet 1: Ramdhari Singh Dinkar
    const dinkar = await User.create({
      name: 'रामधारी सिंह "दिनकर"',
      penName: 'दिनकर',
      era: '1908 – 1974 (राष्ट्रकवि / आधुनिक युग)',
      bio: 'राष्ट्रकवि, ओज और वीर रस के अद्वितीय अमर गायक। रश्मिरथी, उर्वशी, कुरुक्षेत्र और हुंकार के अमर रचयिता। (Public Domain Heritage)',
      languages: ['Hindi', 'Sanskrit'],
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      email: 'heritage_dinkar@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 2: Sant Kabir Das
    const kabir = await User.create({
      name: 'संत कबीर दास',
      penName: 'कबीर',
      era: '1398 – 1518 (भक्तिकाल - निर्गुण धारा)',
      bio: 'भक्तिकाल की निर्गुण ज्ञानाश्रयी शाखा के शिरोमणि संत, समाज सुधारक एवं आध्यात्मिक युगदृष्टा। (Public Domain Ancient Heritage)',
      languages: ['Hindi'],
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      email: 'heritage_kabir@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 3: Mirza Ghalib
    const ghalib = await User.create({
      name: 'मिर्ज़ा असदुल्लाह ख़ाँ "ग़ालिब"',
      penName: 'ग़ालिब',
      era: '1797 – 1869 (दहलवी / मुग़ल काल)',
      bio: 'उर्दू और फ़ारसी शायरी के बेताज बादशाह। मिर्ज़ा नौशा, दहलवी तख़ल्लुस के अमर शायर। (Public Domain Classical)',
      languages: ['Urdu', 'Hindi'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      email: 'heritage_ghalib@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 4: Suryakant Tripathi Nirala
    const nirala = await User.create({
      name: 'सूर्यकांत त्रिपाठी "निराला"',
      penName: 'निराला',
      era: '1896 – 1961 (छायावाद के चार स्तंभ)',
      bio: 'हिंदी में मुक्त छंद के प्रवर्तक, क्रांतिकारी कवि, छायावाद के महाप्राण स्तंभ। (Public Domain Heritage)',
      languages: ['Hindi', 'Sanskrit'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      email: 'heritage_nirala@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 5: Mahadevi Varma
    const mahadevi = await User.create({
      name: 'महादेवी वर्मा',
      penName: 'महादेवी',
      era: '1907 – 1987 (आधुनिक मीरा / ज्ञानपीठ)',
      bio: 'छायावाद की प्रमुख कवयित्री, आधुनिक मीरा, यामा की रचयिता एवं प्रखर विदुषी। (Public Domain Heritage)',
      languages: ['Hindi'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      email: 'heritage_mahadevi@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 6: Rabindranath Tagore
    const tagore = await User.create({
      name: 'रवींद्रनाथ ठाकुर (Rabindranath Tagore)',
      penName: 'भानुसिंह',
      era: '1861 – 1941 (विश्वकवि / नोबेल Laureate)',
      bio: 'नोबेल पुरस्कार से सम्मानित विश्वकवि, गीतांजलि के अमर रचयिता, चित्रकार एवं दार्शनिक। (Public Domain World Heritage)',
      languages: ['Bengali', 'English', 'Hindi'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      email: 'heritage_tagore@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 7: Kavi Kalapi
    const kalapi = await User.create({
      name: 'कवि कलापी (Sursinhji Takhtasinhji)',
      penName: 'कलापी',
      era: '1874 – 1900 (ગુજરાતી સાહિત્યના અમર રાજવી)',
      bio: 'ગુજરાતી સાહિત્યના અમર પ્રણય અને દર્દના કવિ, લાઠીના રાજવી, હૃદય ત્રિપુટીના અમર રચયિતા. (Public Domain Gujarati Heritage)',
      languages: ['Gujarati', 'Hindi'],
      email: 'heritage_kalapi@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 8: Bahinabai Chaudhari
    const bahinabai = await User.create({
      name: 'बहिणाबाई चौधरी (Bahinabai Chaudhari)',
      penName: 'बहिणा',
      era: '1880 – 1951 (मराठीतील थोर निसर्गकन्या)',
      bio: 'मराठी साहित्यातील थोर निसर्गकन्या आणि तत्त्वज्ञ कवयित्री, खान्देशी ओव्यांच्या अमर रचियत्या. (Public Domain Marathi Heritage)',
      languages: ['Marathi', 'Hindi'],
      email: 'heritage_bahinabai@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    // Heritage Poet 9: Sarojini Naidu
    const sarojini = await User.create({
      name: 'सरोजिनी नायडू (Sarojini Naidu)',
      penName: 'The Nightingale of India',
      era: '1879 – 1949 (भारत कोकिला / स्वतंत्रता संग्राम सेनानी)',
      bio: 'Poet, freedom fighter, and lyricist of Indian imagery and folklore in English verse. (Public Domain Indian English Heritage)',
      languages: ['English', 'Hindi'],
      email: 'heritage_sarojini@archive.muktkavya.org',
      password: 'vault_' + Math.random().toString(36),
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: praveenSuperAdmin._id,
      isVerified: true,
    });

    console.log('📜 Seeding Masterpiece Heritage Poems...');

    // -------------------------------------------------------------
    // DINKAR POEMS (Multiple Masterpieces)
    // -------------------------------------------------------------

    // Dinkar 1: Rashmirathi Krishna ki Chetavani
    await Kavita.create({
      title: 'रश्मिरथी: तृतीय सर्ग - कृष्ण की चेतावनी',
      subtitle: 'जब नाश मनुज पर छाता है, पहले विवेक मर जाता है',
      content: `वर्षों तक वन में घूम-घूम,
बाधा-विघ्नों को चूम-चूम,
सह धूप-घाम, पानी-पत्थर,
पांडव आये कुछ और निखर।
सौभाग्य न सब दिन सोता है,
देखें, आगे क्या होता है।

मैत्री की राह बताने को,
सबको सुमार्ग पर लाने को,
दुर्योधन को समझाने को,
भीषण विध्वंस बचाने को,
भगवान हस्तिनापुर आये,
पांडव का संदेशा लाये।

'दो न्याय अगर तो आधा दो,
पर, इसमें भी यदि बाधा हो,
तो दे दो केवल पाँच ग्राम,
रक्खो अपनी धरती तमाम।
हम वहीं खुशी से खायेंगे,
परिजन पर असि न उठायेंगे।'

दुर्योधन वह भी दे न सका,
आशीष समाज की ले न सका,
उलटे, हरि को बाँधने चला,
जो था असाध्य, साधने चला।
जब नाश मनुज पर छाता है,
पहले विवेक मर जाता है।

हरि ने भीषण हुंकार किया,
अपना स्वरूप-विस्तार किया,
डगमग-डगमग दिग्गज डोले,
भगवान कुपित होकर बोले-
'जंजीर बढ़ा कर साध मुझे,
हाँ, हाँ दुर्योधन! बाँध मुझे।`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'वर्षों तक वन में घूम-घूम,',
            'बाधा-विघ्नों को चूम-चूम,',
            'सह धूप-घाम, पानी-पत्थर,',
            'पांडव आये कुछ और निखर।',
            'सौभाग्य न सब दिन सोता है,',
            'देखें, आगे क्या होता है।',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'मैत्री की राह बताने को,',
            'सबको सुमार्ग पर लाने को,',
            'दुर्योधन को समझाने को,',
            'भीषण विध्वंस बचाने को,',
            'भगवान हस्तिनापुर आये,',
            'पांडव का संदेशा लाये।',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            "'दो न्याय अगर तो आधा दो,",
            'पर, इसमें भी यदि बाधा हो,',
            'तो दे दो केवल पाँच ग्राम,',
            'रक्खो अपनी धरती तमाम।',
            'हम वहीं खुशी से खायेंगे,',
            "परिजन पर असि न उठायेंगे।'",
          ],
        },
        {
          stanzaNumber: 4,
          lines: [
            'दुर्योधन वह भी दे न सका,',
            'आशीष समाज की ले न सका,',
            'उलटे, हरि को बाँधने चला,',
            'जो था असाध्य, साधने चला।',
            'जब नाश मनुज पर छाता है,',
            'पहले विवेक मर जाता है।',
          ],
        },
        {
          stanzaNumber: 5,
          lines: [
            'हरि ने भीषण हुंकार किया,',
            'अपना स्वरूप-विस्तार किया,',
            'डगमग-डगमग दिग्गज डोले,',
            'भगवान कुपित होकर बोले-',
            "'जंजीर बढ़ा कर साध मुझे,",
            "हाँ, हाँ दुर्योधन! बाँध मुझे।'",
          ],
        },
      ],
      language: 'Hindi',
      rasa: 'Veer (Heroic/Valor)',
      form: 'Chhand / Matrik',
      theme: 'royal-velvet',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: dinkar._id,
      authorName: dinkar.name,
      penName: dinkar.penName,
      status: 'featured',
      isFeatured: true,
      featuredAt: new Date(),
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Rashmirathi', 'Dinkar', 'Krishna', 'Veer Rasa', 'National Heritage'],
    });

    // Dinkar 2: Kalam Aaj Unki Jai Bol
    await Kavita.create({
      title: 'कलम, आज उनकी जय बोल!',
      subtitle: 'अमर शहीदों और राष्ट्र वीरों को श्रद्धांजलि',
      content: `जला अस्थियाँ बारी-बारी,
चिटकाई जिनमें चिंगारी,
जो चढ़ गये पुण्यवेदी पर,
लिए बिना गर्दन का मोल,
कलम, आज उनकी जय बोल!

जो अगणित लघु दीप हमारे,
तूफानों में एक किनारे,
जल-बुझ गए किसी निशिथ में,
माँगा नहीं स्नेह मुँह खोल,
कलम, आज उनकी जय बोल!

पीकर जिनकी लाल शिखाएँ,
उगल रही सौ लपट दिशाएँ,
जिनके सिंहनाद से सहमी,
धरती रही अभी तक डोल,
कलम, आज उनकी जय बोल!`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'जला अस्थियाँ बारी-बारी,',
            'चिटकाई जिनमें चिंगारी,',
            'जो चढ़ गये पुण्यवेदी पर,',
            'लिए बिना गर्दन का मोल,',
            'कलम, आज उनकी जय बोल!',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'जो अगणित लघु दीप हमारे,',
            'तूफानों में एक किनारे,',
            'जल-बुझ गए किसी निशिथ में,',
            'माँगा नहीं स्नेह मुँह खोल,',
            'कलम, आज उनकी जय बोल!',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            'पीकर जिनकी लाल शिखाएँ,',
            'उगल रही सौ लपट दिशाएँ,',
            'जिनके सिंहनाद से सहमी,',
            'धरती रही अभी तक डोल,',
            'कलम, आज उनकी जय बोल!',
          ],
        },
      ],
      language: 'Hindi',
      rasa: 'Veer (Heroic/Valor)',
      form: 'Geet (Lyrical Poem)',
      theme: 'golden-sunset',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: dinkar._id,
      authorName: dinkar.name,
      penName: dinkar.penName,
      status: 'published',
      isFeatured: false,
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Kalam Aaj Unki Jai Bol', 'Dinkar', 'Veer Rasa', 'Patriotic'],
    });

    // Dinkar 3: Samar Shesh Hai
    await Kavita.create({
      title: 'समर शेष है',
      subtitle: 'नहीं पाप का भागी केवल व्याध, जो तटस्थ हैं समय लिखेगा उनका भी अपराध',
      content: `समर शेष है, नहीं पाप का भागी केवल व्याध,
जो तटस्थ हैं, समय लिखेगा उनका भी अपराध।

धर्मराज के हित भी कुछ अधिकार बचाओ,
पाण्डव के हाथों में विजयी गांडीव थमाओ।
कुरुक्षेत्र की भूमि अभी भी रक्त मांगती प्यासी,
जागो हे भारत के अर्जुन, मिटे देश की त्रासी!`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'समर शेष है, नहीं पाप का भागी केवल व्याध,',
            'जो तटस्थ हैं, समय लिखेगा उनका भी अपराध।',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'धर्मराज के हित भी कुछ अधिकार बचाओ,',
            'पाण्डव के हाथों में विजयी गांडीव थमाओ।',
            'कुरुक्षेत्र की भूमि अभी भी रक्त मांगती प्यासी,',
            'जागो हे भारत के अर्जुन, मिटे देश की त्रासी!',
          ],
        },
      ],
      language: 'Hindi',
      rasa: 'Raudra (Fury/Wrath)',
      form: 'Muktak (Quatrain)',
      theme: 'royal-velvet',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: dinkar._id,
      authorName: dinkar.name,
      penName: dinkar.penName,
      status: 'published',
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Samar Shesh Hai', 'Dinkar', 'Kurukshetra'],
    });

    // -------------------------------------------------------------
    // KABIR POEMS
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'कबीर के अमर दोहे (साखी संग्रह)',
      subtitle: 'पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय',
      content: `पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय।
ढाई आखर प्रेम का, पढ़े सो पंडित होय॥

बुरा जो देखन मैं चला, बुरा न मिलिया कोय।
जो दिल खोजा आपना, मुझसे बुरा न कोय॥

काल करे सो आज कर, आज करे सो अब।
पल में परलय होएगी, बहुरि करेगा कब॥

साधु ऐसा चाहिए, जैसा सूप सुभाय।
सार-सार को गहि रहै, थोथा देई उड़ाय॥

माटी कहे कुम्हार से, तू क्या रोंदे मोहे।
एक दिन ऐसा आएगा, मैं रोंदूंगी तोहे॥`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय।',
            'ढाई आखर प्रेम का, पढ़े सो पंडित होय॥',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'बुरा जो देखन मैं चला, बुरा न मिलिया कोय।',
            'जो दिल खोजा आपना, मुझसे बुरा न कोय॥',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            'काल करे सो आज कर, आज करे सो अब।',
            'पल में परलय होएगी, बहुरि करेगा कब॥',
          ],
        },
        {
          stanzaNumber: 4,
          lines: [
            'साधु ऐसा चाहिए, जैसा सूप सुभाय।',
            'सार-सार को गहि रहै, थोथा देई उड़ाय॥',
          ],
        },
        {
          stanzaNumber: 5,
          lines: [
            'माटी कहे कुम्हार से, तू क्या रोंदे मोहे।',
            'एक दिन ऐसा आएगा, मैं रोंदूंगी तोहे॥',
          ],
        },
      ],
      language: 'Hindi',
      rasa: 'Bhakti (Devotion/Spiritual)',
      form: 'Dohe (Couplets)',
      theme: 'golden-sunset',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: kabir._id,
      authorName: kabir.name,
      penName: kabir.penName,
      status: 'featured',
      isFeatured: true,
      featuredAt: new Date(),
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Kabir', 'Dohe', 'Bhakti', 'Wisdom', 'Philosophy'],
    });

    // -------------------------------------------------------------
    // GHALIB POEMS
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'दिल-ए-नादाँ तुझे हुआ क्या है',
      subtitle: 'आख़िर इस दर्द की दवा क्या है',
      content: `दिल-ए-नादाँ तुझे हुआ क्या है?
आख़िर इस दर्द की दवा क्या है?

हम हैं मुश्ताक़ और वो बेज़ार,
या इलाही ये माजरा क्या है?

मैं भी मुँह में ज़बान रखता हूँ,
काश पूछो कि मुद्दआ क्या है!

जब कि तुझ बिन नहीं कोई मौजूद,
फिर ये हंगामा, ऐ ख़ुदा क्या है?

हम को उन से वफ़ा की है उम्मीद,
जो नहीं जानते वफ़ा क्या है।

जान तुम पर निसार करता हूँ,
मैं नहीं जानता दुआ क्या है।`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'दिल-ए-नादाँ तुझे हुआ क्या है?',
            'आख़िर इस दर्द की दवा क्या है?',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'हम हैं मुश्ताक़ और वो बेज़ार,',
            'या इलाही ये माजरा क्या है?',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            'मैं भी मुँह में ज़बान रखता हूँ,',
            'काश पूछो कि मुद्दआ क्या है!',
          ],
        },
        {
          stanzaNumber: 4,
          lines: [
            'जब कि तुझ बिन नहीं कोई मौजूद,',
            'फिर ये हंगामा, ऐ ख़ुदा क्या है?',
          ],
        },
        {
          stanzaNumber: 5,
          lines: [
            'हम को उन से वफ़ा की है उम्मीद,',
            'जो नहीं जानते वफ़ा क्या है।',
          ],
        },
        {
          stanzaNumber: 6,
          lines: [
            'जान तुम पर निसार करता हूँ,',
            'मैं नहीं जानता दुआ क्या है।',
          ],
        },
      ],
      language: 'Urdu',
      rasa: 'Karun (Pathos/Compassion)',
      form: 'Ghazal (Couplets/Sher)',
      theme: 'midnight-cosmos',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: ghalib._id,
      authorName: ghalib.name,
      penName: ghalib.penName,
      status: 'featured',
      isFeatured: true,
      featuredAt: new Date(),
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Ghalib', 'Ghazal', 'Urdu', 'Dard', 'Classical'],
    });

    // -------------------------------------------------------------
    // NIRALA POEMS
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'वर दे, वीणावादिनि वर दे!',
      subtitle: 'प्रिय स्वतंत्र-रव, अमृत-मंत्र नव भारत में भर दे!',
      content: `वर दे, वीणावादिनि वर दे!
प्रिय स्वतंत्र-रव, अमृत-मंत्र नव
भारत में भर दे!

काट अंध-उर के बंधन-स्तर
बहा जननि, ज्योतिर्मय निर्झर;
कलुष-भेद-तम हर प्रकाश भर
जगमग जग कर दे!

नव गति, नव लय, ताल-छंद नव
नवल कंठ, नव जलद-मन्द्ररव;
नव नभ के नव विहग-वृंद को
नव पर, नव स्वर दे!`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'वर दे, वीणावादिनि वर दे!',
            'प्रिय स्वतंत्र-रव, अमृत-मंत्र नव',
            'भारत में भर दे!',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'काट अंध-उर के बंधन-स्तर',
            'बहा जननि, ज्योतिर्मय निर्झर;',
            'कलुष-भेद-तम हर प्रकाश भर',
            'जगमग जग कर दे!',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            'नव गति, नव लय, ताल-छंद नव',
            'नवल कंठ, नव जलद-मन्द्ररव;',
            'नव नभ के नव विहग-वृंद को',
            'नव पर, नव स्वर दे!',
          ],
        },
      ],
      language: 'Hindi',
      rasa: 'Bhakti (Devotion/Spiritual)',
      form: 'Geet (Lyrical Poem)',
      theme: 'classic-ivory',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: nirala._id,
      authorName: nirala.name,
      penName: nirala.penName,
      status: 'published',
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Nirala', 'Saraswati Vandana', 'Hindi', 'Classical'],
    });

    // -------------------------------------------------------------
    // MAHADEVI VARMA
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'मैं नीर भरी दुख की बदली!',
      subtitle: 'स्पंदन में चिर निस्पंद बसा, क्रंदन में आहत विश्व हंसा',
      content: `मैं नीर भरी दुख की बदली!
स्पंदन में चिर निस्पंद बसा,
क्रंदन में आहत विश्व हंसा,
नयनों में दीपक से जलते,
पलकों में निर्झरिणी मचली!

मेरा पग पग संगीत भरा,
श्वासों में स्वप्न पराग झरा,
नभ के नव रंग बुनते दुकूल,
छाया में मलय बयार पली!

विस्तृत नभ का कोई कोना,
मेरा न कभी अपना होना,
परिचय इतना इतिहास यही-
उमड़ी कल थी मिट आज चली!`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'मैं नीर भरी दुख की बदली!',
            'स्पंदन में चिर निस्पंद बसा,',
            'क्रंदन में आहत विश्व हंसा,',
            'नयनों में दीपक से जलते,',
            'पलकों में निर्झरिणी मचली!',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'मेरा पग पग संगीत भरा,',
            'श्वासों में स्वप्न पराग झरा,',
            'नभ के नव रंग बुनते दुकूल,',
            'छाया में मलय बयार पली!',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            'विस्तृत नभ का कोई कोना,',
            'मेरा न कभी अपना होना,',
            'परिचय इतना इतिहास यही-',
            'उमड़ी कल थी मिट आज चली!',
          ],
        },
      ],
      language: 'Hindi',
      rasa: 'Karun (Pathos/Compassion)',
      form: 'Geet (Lyrical Poem)',
      theme: 'vintage-parchment',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: mahadevi._id,
      authorName: mahadevi.name,
      penName: mahadevi.penName,
      status: 'published',
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Mahadevi Varma', 'Chhayavad', 'Karun Rasa'],
    });

    // -------------------------------------------------------------
    // TAGORE
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'चित्त जेथा भयशून्य (Where the Mind Is Without Fear)',
      subtitle: 'Gitanjali - Song 35',
      content: `Where the mind is without fear and the head is held high;
Where knowledge is free;
Where the world has not been broken up into fragments
By narrow domestic walls;
Where words come out from the depth of truth;
Where tireless striving stretches its arms towards perfection;
Where the clear stream of reason has not lost its way
Into the dreary desert sand of dead habit;
Where the mind is led forward by thee
Into ever-widening thought and action;
Into that heaven of freedom, my Father,
Let my country awake.`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'Where the mind is without fear and the head is held high;',
            'Where knowledge is free;',
            'Where the world has not been broken up into fragments',
            'By narrow domestic walls;',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'Where words come out from the depth of truth;',
            'Where tireless striving stretches its arms towards perfection;',
            'Where the clear stream of reason has not lost its way',
            'Into the dreary desert sand of dead habit;',
          ],
        },
        {
          stanzaNumber: 3,
          lines: [
            'Where the mind is led forward by thee',
            'Into ever-widening thought and action;',
            'Into that heaven of freedom, my Father,',
            'Let my country awake.',
          ],
        },
      ],
      language: 'English',
      rasa: 'Shant (Peace/Serenity)',
      form: 'Mukt Kavya (Free Verse)',
      theme: 'emerald-forest',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: tagore._id,
      authorName: tagore.name,
      penName: tagore.penName,
      status: 'featured',
      isFeatured: true,
      featuredAt: new Date(),
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Tagore', 'Gitanjali', 'Freedom', 'Nobel'],
    });

    // -------------------------------------------------------------
    // KALAPI (GUJARATI)
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'આપની યાદી (કલાપીનો કેકારવ)',
      subtitle: 'જ્યાં જ્યાં નજર મારી ઠરે, યાદી ભરી ત્યાં આપની',
      content: `જ્યાં જ્યાં નજર મારી ઠરે, યાદી ભરી ત્યાં આપની,
આંસુ મહીં છે આંખથી વહી જતી યાદી આપની!

ચમકે ચમનમાં ફૂલ જે, સુગંધ છે એ આપની,
તારા મહીં આકાશમાં છે તેજ આભે આપની!`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'જ્યાં જ્યાં નજર મારી ઠરે, યાદી ભરી ત્યાં આપની,',
            'આંસુ મહીં છે આંખથી વહી જતી યાદી આપની!',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'ચમકે ચમનમાં ફૂલ જે, સુગંધ છે એ આપની,',
            'તારા મહીં આકાશમાં છે તેજ આભે આપની!',
          ],
        },
      ],
      language: 'Gujarati',
      rasa: 'Shringar (Romance/Beauty)',
      form: 'Ghazal (Couplets/Sher)',
      theme: 'rose-saffron',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: kalapi._id,
      authorName: kalapi.name,
      penName: kalapi.penName,
      status: 'published',
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Kalapi', 'Gujarati', 'Kekarav'],
    });

    // -------------------------------------------------------------
    // BAHINABAI (MARATHI)
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'अरे संसार संसार',
      subtitle: 'आधी हाताले चटके तव्हा मिळती भाकर',
      content: `अरे संसार संसार,
जसा तवा चुल्ह्यावर!
आधी हाताले चटके,
तव्हा मिळती भाकर!

अरे संसार संसार,
खोटा कधी म्हनू नये!
राऊळाच्या कळसाले,
लोटा कधी म्हनू नये!`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'अरे संसार संसार,',
            'जसा तवा चुल्ह्यावर!',
            'आधी हाताले चटके,',
            'तव्हा मिळती भाकर!',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'अरे संसार संसार,',
            'खोटा कधी म्हनू नये!',
            'राऊळाच्या कळसाले,',
            'लोटा कधी म्हनू नये!',
          ],
        },
      ],
      language: 'Marathi',
      rasa: 'Karun (Pathos/Compassion)',
      form: 'Geet (Lyrical Poem)',
      theme: 'golden-sunset',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: bahinabai._id,
      authorName: bahinabai.name,
      penName: bahinabai.penName,
      status: 'published',
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Bahinabai', 'Marathi', 'Sansar'],
    });

    // -------------------------------------------------------------
    // SAROJINI NAIDU
    // -------------------------------------------------------------
    await Kavita.create({
      title: 'In the Bazaars of Hyderabad',
      subtitle: 'What do you sell O ye merchants?',
      content: `What do you sell O ye merchants?
Richly your wares are displayed.
Turbans of crimson and silver,
Tunics of purple brocade,
Mirrors with panels of amber,
Daggers with handles of jade.

What do you weigh, O ye vendors?
Saffron and lentil and rice.
What do you grind, O ye maidens?
Sandalwood, henna, and spice.
What do you call, O ye pedlars?
Chessmen and ivory dice.`,
      stanzas: [
        {
          stanzaNumber: 1,
          lines: [
            'What do you sell O ye merchants?',
            'Richly your wares are displayed.',
            'Turbans of crimson and silver,',
            'Tunics of purple brocade,',
            'Mirrors with panels of amber,',
            'Daggers with handles of jade.',
          ],
        },
        {
          stanzaNumber: 2,
          lines: [
            'What do you weigh, O ye vendors?',
            'Saffron and lentil and rice.',
            'What do you grind, O ye maidens?',
            'Sandalwood, henna, and spice.',
            'What do you call, O ye pedlars?',
            'Chessmen and ivory dice.',
          ],
        },
      ],
      language: 'English',
      rasa: 'Adbhut (Wonder/Awe)',
      form: 'Geet (Lyrical Poem)',
      theme: 'royal-velvet',
      fontFamily: 'Rozha One, Tiro Devanagari Hindi, serif',
      author: sarojini._id,
      authorName: sarojini.name,
      penName: sarojini.penName,
      status: 'published',
      isHeritage: true,
      maintainedBy: praveenSuperAdmin._id,
      viewsCount: 0,
      likesCount: 0,
      tags: ['Sarojini Naidu', 'Hyderabad', 'Lyric', 'Indian Heritage'],
    });

    console.log('✅ Mukt Kavya Seeding Complete!');
    console.log('👑 Super Admin Accounts:');
    console.log('   - praveen.pr105@gmail.com / praveen@2020');
    console.log('   - superadmin@muktkavya.com / password');
    console.log('🏛️ Classical Heritage Poets created with NO exposed IDs/passwords (Maintained by Super Admin):');
    console.log('   - Ramdhari Singh Dinkar (Multiple poems: Rashmirathi, Kalam Aaj Unki Jai Bol, Samar Shesh Hai)');
    console.log('   - Sant Kabir Das (Amrit Dohe)');
    console.log('   - Mirza Ghalib (Dil-e-Nadan)');
    console.log('   - Suryakant Tripathi Nirala (Var De Veenavadini)');
    console.log('   - Mahadevi Varma (Neer Bhari Dukh Ki Badli)');
    console.log('   - Rabindranath Tagore (Where The Mind Is Without Fear)');
    console.log('   - Kavi Kalapi, Bahinabai, Sarojini Naidu');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
