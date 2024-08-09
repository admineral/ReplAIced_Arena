import { UserRank } from '../types';

export const sortUsers = (users: UserRank[], activeTab: string): UserRank[] => {
  switch (activeTab) {
    case 'attackers':
      return [...users].sort((a, b) => b.attacksLaunched - a.attacksLaunched);
    case 'defenders':
      return [...users].sort((a, b) => b.defensesSuccessful - a.defensesSuccessful);
    default:
      return users;
  }
};