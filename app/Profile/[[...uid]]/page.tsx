'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/firebase-config';
import { doc, getDoc, DocumentData, collection, addDoc, deleteDoc, getDocs, setDoc } from "firebase/firestore"; // Added setDoc
import { User } from 'firebase/auth';

interface UserStats {
  attacksLaunched: number;
  defensesSuccessful: number;
  rank: number;
  level: number;
  experience: number;
}
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// Define the Article interface
interface Article {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  published: boolean;
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userIdFromUrl = Array.isArray(params.uid) ? params.uid[0] : params.uid;
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [imageError, setImageError] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', content: '' });
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string } | null>(null);

  // Funktion zum Erstellen eines Artikels
  const createArticle = async (title: string, content: string) => {
    if (!user) return;
    const articlesRef = collection(db, 'articles');
    const newArticleDoc = await addDoc(articlesRef, {
      userId: user.uid,
      title,
      content,
      timestamp: new Date(),
      published: false, // Standardmäßig nicht veröffentlicht
    });
    setArticles([...articles, { id: newArticleDoc.id, title, content, timestamp: new Date(), published: false }]);
  };

  // Funktion zum Löschen eines Artikels
  const deleteArticle = async (id: string) => {
    await deleteDoc(doc(db, 'articles', id));
    setArticles(articles.filter(article => article.id !== id));
    setArticleToDelete(null);
  };

  // Funktion zum Veröffentlichen eines Artikels
  const publishArticle = async (id: string) => {
    const articleRef = doc(db, 'articles', id);
    await setDoc(articleRef, { published: true }, { merge: true });
    setArticles(articles.map(article => article.id === id ? { ...article, published: true } : article));
  };

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return;
      const articlesRef = collection(db, 'articles');
      const articlesSnapshot = await getDocs(articlesRef);
      const articlesData = articlesSnapshot.docs
        .filter(doc => doc.data().userId === user.uid)
        .map(doc => ({
          id: doc.id,
          title: doc.data().title,
          content: doc.data().content,
          timestamp: doc.data().timestamp.toDate(),
          published: doc.data().published || false, // Veröffentlichungsstatus
        }));
      setArticles(articlesData);
    };

    fetchArticles();
  }, [user]);

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching data for user:", uid);
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as DocumentData;
          console.log("User data:", userData);
          setUserStats({
            attacksLaunched: userData.attacksLaunched || 0,
            defensesSuccessful: userData.defensesSuccessful || 0,
            rank: userData.rank || 0,
            level: userData.level || 1,
            experience: userData.experience || 0,
          });
          setAchievements(userData.achievements || []);
          setProfileUser({
            uid,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
          } as User);
        } else {
          console.log("No user data found for:", uid);
          setError("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    console.log("userIdFromUrl:", userIdFromUrl);
    console.log("logged in user:", user?.uid);
    if (userIdFromUrl) {
      fetchUserData(userIdFromUrl);
    } else if (user) {
      fetchUserData(user.uid);
    } else {
      console.log("No user ID available, redirecting to login");
      router.push('/Login');
    }
  }, [userIdFromUrl, user, router]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }
  if (!userStats || !profileUser) {
    return <div className="min-h-screen flex items-center justify-center">No user data available</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-24 sm:pt-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {!imageError && profileUser.photoURL ? (
                  <Image
                    src={profileUser.photoURL}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-blue-500"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-blue-300">
                    {profileUser.displayName ? profileUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">AI Security Expert</div>
                <h1 className="text-2xl font-bold">{profileUser.displayName || 'Anonymous User'}</h1>
                <p className="text-sm text-gray-300">{profileUser.email}</p>
                <div className="mt-2 flex items-center">
                  <div className="text-yellow-400 text-xl mr-2">⭐</div>
                  <div className="font-semibold text-sm">Level {userStats.level}</div>
                  <div className="ml-2 bg-gray-700 h-2 rounded-full w-24">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${(userStats.experience % 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{userStats.attacksLaunched}</div>
                <div className="text-xs text-gray-300">Attacks Launched</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.defensesSuccessful}</div>
                <div className="text-xs text-gray-300">Defenses Successful</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center col-span-2">
                <div className="text-2xl font-bold text-yellow-400">#{userStats.rank}</div>
                <div className="text-xs text-gray-300">Global Rank</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`bg-gray-700 rounded-lg p-4 text-center ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-semibold text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-300">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Articles</h2>
            <div>
              <button 
                onClick={() => setIsPopupOpen(true)} 
                className="bg-blue-500 text-white px-4 py-2 rounded" 
                style={{ display: 'none' }}
              >
                Create Article
              </button>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {articles.map(article => (
                  <div
                    key={article.id}
                    className="bg-gray-700 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition duration-200"
                    onClick={() => { setSelectedArticle({ title: article.title, content: article.content }); }}
                  >
                    <h3 className="font-bold text-lg">{article.title}</h3>
                    <p className="text-xs text-gray-400">{new Date(article.timestamp).toLocaleString()}</p>
                    <p className={`text-xs ${article.published ? 'text-green-400' : 'text-red-400'}`}>
                      {article.published ? 'Published' : 'Not Published'}
                    </p>
                    <button onClick={(e) => { e.stopPropagation(); publishArticle(article.id); }} className="text-blue-500 mt-2">Publish</button>
                    <button onClick={(e) => { e.stopPropagation(); setArticleToDelete({ id: article.id, title: article.title }); }} className="text-red-500 mt-2">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {isPopupOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4 text-white">Neuen Artikel schreiben</h2>
                <input
                  type="text"
                  placeholder="Titel"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="border border-gray-600 p-2 w-full mb-4 bg-gray-700 text-white"
                />
                <textarea
                  placeholder="Inhalt"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  className="border border-gray-600 p-2 w-full mb-4 bg-gray-700 text-white"
                  rows={4}
                />
                <div className="flex justify-between">
                  <button onClick={() => { createArticle(newArticle.title, newArticle.content); setIsPopupOpen(false); }} className="bg-green-500 text-white px-4 py-2 rounded">Artikel speichern</button>
                  <button onClick={() => setIsPopupOpen(false)} className="bg-red-500 text-white px-4 py-2 rounded">Abbrechen</button>
                </div>
              </div>
            </div>
          )}
          {articleToDelete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4 text-white">Artikel löschen</h2>
                <p className="text-white">Möchten Sie den Artikel "{articleToDelete.title}" wirklich löschen?</p>
                <div className="flex justify-between mt-4">
                  <button onClick={() => deleteArticle(articleToDelete.id)} className="bg-red-500 text-white px-4 py-2 rounded">Löschen</button>
                  <button onClick={() => setArticleToDelete(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Abbrechen</button>
                </div>
              </div>
            </div>
          )}
          {selectedArticle && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4 text-white">{selectedArticle.title}</h2>
                <p className="text-white">{selectedArticle.content}</p>
                <button onClick={() => setSelectedArticle(null)} className="bg-gray-500 text-white px-4 py-2 rounded mt-4">Schließen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}