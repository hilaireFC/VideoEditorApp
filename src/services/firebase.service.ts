// src/services/firebase.service.ts
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface ProjectData {
  id: string;
  name: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  videoClips: string; // JSON stringify
  audioClips: string; // JSON stringify
  textOverlays: string; // JSON stringify
  lastModified: number;
}

export const FirebaseService = {
  getProjectsCollection: () => {
    const user = auth().currentUser;
    if (!user) throw new Error('Utilisateur non connecté');
    return firestore().collection('users').doc(user.uid).collection('projects');
  },

  saveProject: async (project: Omit<ProjectData, 'lastModified'>): Promise<void> => {
    try {
      const collection = FirebaseService.getProjectsCollection();
      await collection.doc(project.id).set({
        ...project,
        lastModified: Date.now(),
      });
      console.log('Projet sauvegardé sur Firebase:', project.id);
    } catch (error) {
      console.error('Erreur de sauvegarde Firestore:', error);
      throw error;
    }
  },

  getProjects: async (): Promise<ProjectData[]> => {
    try {
      const collection = FirebaseService.getProjectsCollection();
      const snapshot = await collection.orderBy('lastModified', 'desc').get();
      return snapshot.docs.map((doc) => doc.data() as ProjectData);
    } catch (error) {
      console.error('Erreur de récupération Firestore:', error);
      return [];
    }
  },

  deleteProject: async (projectId: string): Promise<void> => {
    try {
      const collection = FirebaseService.getProjectsCollection();
      await collection.doc(projectId).delete();
      console.log('Projet supprimé de Firebase:', projectId);
    } catch (error) {
      console.error('Erreur de suppression Firestore:', error);
      throw error;
    }
  },
};
