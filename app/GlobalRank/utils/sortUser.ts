import { UserRank } from '../types';

export const sortUsers = (users: UserRank[], activeTab: string): UserRank[] => {
  return [...users].sort((a, b) => {
    switch (activeTab) {
      case 'attackers':
        return b.attacksLaunched - a.attacksLaunched || b.level - a.level || b.experience - a.experience;
      case 'defenders':
        return b.defensesSuccessful - a.defensesSuccessful || b.level - a.level || b.experience - a.experience;
      case 'overall':
      default:
        return b.level - a.level || b.experience - a.experience || b.streak - a.streak;
    }
  });
};