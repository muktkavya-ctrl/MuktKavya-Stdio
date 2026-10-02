import MongooseUser from './User.js';
import MongooseKavita from './Kavita.js';
import MongooseComment from './Comment.js';
import MongooseNotification from './Notification.js';
import { UserModel, KavitaModel, CommentModel } from '../config/store.js';
import { isRealMongoConnected } from '../config/db.js';

export const User = new Proxy({}, {
  get: (target, prop) => {
    const model = isRealMongoConnected ? MongooseUser : UserModel;
    const value = model[prop];
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export const Kavita = new Proxy({}, {
  get: (target, prop) => {
    const model = isRealMongoConnected ? MongooseKavita : KavitaModel;
    const value = model[prop];
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export const Comment = new Proxy({}, {
  get: (target, prop) => {
    const model = isRealMongoConnected ? MongooseComment : CommentModel;
    const value = model[prop];
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export const Notification = MongooseNotification;
export { SecurityTelemetry } from './SecurityTelemetry.js';

export default { User, Kavita, Comment, Notification };
