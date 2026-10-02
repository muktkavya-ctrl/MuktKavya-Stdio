import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'mukt_kavya_db.json');

// Ensure DB file exists
const loadData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { users: [], kavitas: [], comments: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading embedded db:', e);
    return { users: [], kavitas: [], comments: [] };
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing embedded db:', e);
  }
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// User Model Wrapper
class UserModel {
  static async create(doc) {
    const data = loadData();
    const id = generateId();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(doc.password, salt);

    const newUser = {
      _id: id,
      name: doc.name,
      email: doc.email.toLowerCase(),
      password: hashedPassword,
      role: doc.role || 'writer',
      penName: doc.penName || '',
      bio: doc.bio || 'A seeker of verse and poetic expressions.',
      avatar: doc.avatar || '',
      languages: doc.languages || ['Hindi', 'English'],
      socials: doc.socials || {},
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveData(data);
    return UserModel.wrap(newUser);
  }

  static async findOne(query) {
    const data = loadData();
    let user = null;
    if (query.email) {
      user = data.users.find((u) => u.email.toLowerCase() === query.email.toLowerCase());
    } else if (query._id) {
      user = data.users.find((u) => u._id === query._id.toString());
    }
    return user ? UserModel.wrap(user) : null;
  }

  static async findById(id) {
    const data = loadData();
    const user = data.users.find((u) => u._id === id?.toString());
    return user ? UserModel.wrap(user) : null;
  }

  static async find(query = {}) {
    const data = loadData();
    let results = [...data.users];

    if (query.role && query.role !== 'All') {
      if (typeof query.role === 'object' && query.role.$in) {
        results = results.filter((u) => query.role.$in.includes(u.role));
      } else {
        results = results.filter((u) => u.role === query.role);
      }
    }

    if (query.$or) {
      const terms = query.$or.map((cond) => {
        const key = Object.keys(cond)[0];
        return { key, val: cond[key].$regex };
      });
      results = results.filter((u) => {
        return terms.some((t) => {
          const val = u[t.key] || '';
          return new RegExp(t.val, 'i').test(val);
        });
      });
    }

    return {
      sort: (sortObj) => ({
        skip: (skipCount) => ({
          limit: (limitCount) =>
            results
              .slice(skipCount, skipCount + limitCount)
              .map((u) => UserModel.wrap(u)),
        }),
      }),
      select: () => results.map((u) => UserModel.wrap(u)),
    };
  }

  static async countDocuments(query = {}) {
    const data = loadData();
    let results = [...data.users];
    if (query.role) {
      if (typeof query.role === 'object' && query.role.$in) {
        results = results.filter((u) => query.role.$in.includes(u.role));
      } else {
        results = results.filter((u) => u.role === query.role);
      }
    }
    return results.length;
  }

  static async deleteMany() {
    const data = loadData();
    data.users = [];
    saveData(data);
    return { acknowledged: true, deletedCount: 0 };
  }

  static wrap(userObj) {
    const instance = { ...userObj };

    instance.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, instance.password);
    };

    instance.getSignedJwtToken = function () {
      return jwt.sign(
        { id: instance._id, role: instance.role, email: instance.email, name: instance.name },
        process.env.JWT_SECRET || 'fallback_secret_mukt_kavya_2026',
        { expiresIn: '30d' }
      );
    };

    instance.save = async function () {
      const data = loadData();
      const idx = data.users.findIndex((u) => u._id === instance._id);
      if (idx !== -1) {
        data.users[idx] = { ...instance, updatedAt: new Date().toISOString() };
        saveData(data);
      }
      return instance;
    };

    instance.select = function () {
      return instance;
    };

    return instance;
  }
}

// Kavita Model Wrapper
class KavitaModel {
  static async create(doc) {
    const data = loadData();
    const id = generateId();

    const newKavita = {
      _id: id,
      title: doc.title,
      subtitle: doc.subtitle || '',
      content: doc.content,
      stanzas: doc.stanzas || [],
      language: doc.language || 'Hindi',
      rasa: doc.rasa || 'Shant (Peace/Serenity)',
      form: doc.form || 'Mukt Kavya (Free Verse)',
      theme: doc.theme || 'vintage-parchment',
      fontFamily: doc.fontFamily || 'Rozha One, Tiro Devanagari Hindi, serif',
      author: doc.author?._id ? doc.author._id.toString() : doc.author?.toString(),
      authorName: doc.authorName,
      penName: doc.penName || '',
      status: doc.status || 'published',
      tags: doc.tags || [],
      audioUrl: doc.audioUrl || '',
      likesCount: doc.likesCount || 0,
      viewsCount: doc.viewsCount || 0,
      bookmarksCount: doc.bookmarksCount || 0,
      sharesCount: doc.sharesCount || 0,
      isFeatured: !!doc.isFeatured,
      featuredAt: doc.featuredAt || null,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.kavitas.push(newKavita);
    saveData(data);
    return KavitaModel.wrap(newKavita);
  }

  static async findById(id) {
    const data = loadData();
    const k = data.kavitas.find((item) => item._id === id?.toString());
    if (!k) return null;

    const wrapped = KavitaModel.wrap(k);
    return {
      ...wrapped,
      populate: async (field, selectFields) => {
        if (field === 'author') {
          const author = data.users.find((u) => u._id === k.author);
          wrapped.author = author || { name: k.authorName, penName: k.penName };
        }
        return wrapped;
      },
    };
  }

  static async findOne(query = {}) {
    const data = loadData();
    let k = null;
    if (query.isFeatured) {
      k = data.kavitas.find((item) => item.isFeatured && item.status === 'published');
    }
    if (!k && query.status) {
      k = data.kavitas.find((item) => item.status === query.status);
    }
    if (!k && data.kavitas.length > 0) {
      k = data.kavitas[0];
    }
    if (!k) return null;

    const wrapped = KavitaModel.wrap(k);
    return {
      ...wrapped,
      populate: (field) => ({
        sort: () => wrapped,
      }),
    };
  }

  static find(query = {}) {
    const data = loadData();
    let results = [...data.kavitas];

    if (query.status) {
      if (typeof query.status === 'object' && query.status.$in) {
        results = results.filter((k) => query.status.$in.includes(k.status));
      } else {
        results = results.filter((k) => k.status === query.status);
      }
    }

    if (query.language && query.language !== 'All') {
      results = results.filter((k) => k.language === query.language);
    }

    if (query.rasa && query.rasa !== 'All') {
      results = results.filter((k) =>
        new RegExp(query.rasa, 'i').test(k.rasa)
      );
    }

    if (query.form && query.form !== 'All') {
      results = results.filter((k) =>
        new RegExp(query.form, 'i').test(k.form)
      );
    }

    if (query.theme && query.theme !== 'All') {
      results = results.filter((k) => k.theme === query.theme);
    }

    if (query.author) {
      results = results.filter((k) => k.author === query.author.toString());
    }

    if (query.isFeatured) {
      results = results.filter((k) => k.isFeatured === true);
    }

    if (query.$or) {
      results = results.filter((k) => {
        return query.$or.some((cond) => {
          const key = Object.keys(cond)[0];
          const pattern = cond[key]?.$regex;
          if (key === 'tags') {
            return k.tags && k.tags.some((t) => new RegExp(pattern, 'i').test(t));
          }
          return new RegExp(pattern, 'i').test(k[key] || '');
        });
      });
    }

    const chainable = {
      populate: (field, select) => chainable,
      sort: (sortObj) => {
        if (sortObj?.viewsCount === -1) {
          results.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
        } else if (sortObj?.likesCount === -1) {
          results.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        } else if (sortObj?.createdAt === 1) {
          results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return chainable;
      },
      skip: (skipCount) => {
        results = results.slice(skipCount);
        return chainable;
      },
      limit: (limitCount) => {
        results = results.slice(0, limitCount);
        return results.map((k) => KavitaModel.wrap(k));
      },
      then: (resolve, reject) => {
        Promise.resolve(results.map((k) => KavitaModel.wrap(k))).then(resolve, reject);
      },
    };

    return chainable;
  }

  static async countDocuments(query = {}) {
    const data = loadData();
    let results = [...data.kavitas];

    if (query.status) {
      if (typeof query.status === 'object' && query.status.$in) {
        results = results.filter((k) => query.status.$in.includes(k.status));
      } else {
        results = results.filter((k) => k.status === query.status);
      }
    }

    if (query.isFeatured) {
      results = results.filter((k) => k.isFeatured === true);
    }

    return results.length;
  }

  static async aggregate(pipeline = []) {
    const data = loadData();
    const groupStage = pipeline.find((p) => p.$group);
    if (!groupStage) return [];

    const groupId = groupStage.$group._id;

    if (groupId === '$language') {
      const map = {};
      data.kavitas.forEach((k) => {
        map[k.language] = (map[k.language] || 0) + 1;
      });
      return Object.entries(map).map(([key, count]) => ({ _id: key, count }));
    }

    if (groupId === '$rasa') {
      const map = {};
      data.kavitas.forEach((k) => {
        map[k.rasa] = (map[k.rasa] || 0) + 1;
      });
      return Object.entries(map).map(([key, count]) => ({ _id: key, count }));
    }

    if (groupId === null) {
      const totalViews = data.kavitas.reduce((acc, k) => acc + (k.viewsCount || 0), 0);
      const totalLikes = data.kavitas.reduce((acc, k) => acc + (k.likesCount || 0), 0);
      return [{ _id: null, totalViews, totalLikes }];
    }

    return [];
  }

  static async deleteOne(query) {
    const data = loadData();
    data.kavitas = data.kavitas.filter((k) => k._id !== query._id?.toString());
    saveData(data);
    return { acknowledged: true, deletedCount: 1 };
  }

  static async deleteMany() {
    const data = loadData();
    data.kavitas = [];
    saveData(data);
    return { acknowledged: true, deletedCount: 0 };
  }

  static wrap(kavitaObj) {
    const instance = { ...kavitaObj };

    instance.save = async function () {
      const data = loadData();
      const idx = data.kavitas.findIndex((k) => k._id === instance._id);
      if (idx !== -1) {
        data.kavitas[idx] = { ...instance, updatedAt: new Date().toISOString() };
        saveData(data);
      }
      return instance;
    };

    return instance;
  }
}

// Comment Model Wrapper
class CommentModel {
  static async create(doc) {
    const data = loadData();
    const id = generateId();

    const newComment = {
      _id: id,
      kavita: doc.kavita?.toString(),
      user: doc.user?.toString(),
      userName: doc.userName,
      userRole: doc.userRole || 'reader',
      content: doc.content,
      createdAt: new Date().toISOString(),
    };

    data.comments.push(newComment);
    saveData(data);
    return newComment;
  }

  static find(query = {}) {
    const data = loadData();
    let results = [...data.comments];
    if (query.kavita) {
      results = results.filter((c) => c.kavita === query.kavita.toString());
    }

    const chainable = {
      sort: (sortObj) => chainable,
      limit: (count) => results.slice(0, count),
      then: (resolve, reject) => {
        Promise.resolve(results).then(resolve, reject);
      },
    };

    return chainable;
  }

  static async countDocuments() {
    const data = loadData();
    return data.comments.length;
  }

  static async deleteMany(query = {}) {
    const data = loadData();
    if (query.kavita) {
      data.comments = data.comments.filter((c) => c.kavita !== query.kavita.toString());
    } else {
      data.comments = [];
    }
    saveData(data);
    return { acknowledged: true };
  }
}

export { UserModel, KavitaModel, CommentModel, loadData };
