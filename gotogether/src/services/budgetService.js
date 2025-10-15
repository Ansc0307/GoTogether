import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Colecciones de Firestore
const COLLECTIONS = {
  TRIPS: 'trips',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  MEMBERS: 'members'
};

export class BudgetService {
  constructor(tripId = 'default-trip') {
    this.tripId = tripId;
  }

  // ========== PRESUPUESTO ==========
  async getBudget() {
    try {
      const budgetRef = doc(db, COLLECTIONS.BUDGETS, this.tripId);
      const budgetDoc = await getDocs(query(collection(db, COLLECTIONS.BUDGETS), where('tripId', '==', this.tripId)));
      
      if (!budgetDoc.empty) {
        return budgetDoc.docs[0].data();
      }
      
      // Si no existe, crear uno por defecto
      const defaultBudget = {
        tripId: this.tripId,
        total: 15000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, COLLECTIONS.BUDGETS), defaultBudget);
      return defaultBudget;
    } catch (error) {
      console.error('Error getting budget:', error);
      return { total: 15000 };
    }
  }

  async updateBudget(newTotal) {
    try {
      const budgetQuery = query(collection(db, COLLECTIONS.BUDGETS), where('tripId', '==', this.tripId));
      const budgetDocs = await getDocs(budgetQuery);
      
      if (!budgetDocs.empty) {
        const budgetDoc = budgetDocs.docs[0];
        await updateDoc(budgetDoc.ref, {
          total: newTotal,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // ========== GASTOS ==========
  async getExpenses() {
    try {
      // Simplificar consulta para evitar índices complejos
      const expensesQuery = query(
        collection(db, COLLECTIONS.EXPENSES),
        where('tripId', '==', this.tripId)
      );
      
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar en el cliente
      return expenses.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date();
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async addExpense(expense) {
    try {
      const newExpense = {
        descripcion: expense.descripcion,
        monto: expense.monto,
        pagadoPor: {
          id: expense.pagadoPor.id,
          name: expense.pagadoPor.name
        },
        participantes: expense.participantes || [], // Array de objetos {id, name}
        tripId: this.tripId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), newExpense);
      return { id: docRef.id, ...newExpense };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  async updateExpense(expenseId, updates) {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId) {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // ========== MIEMBROS ==========
  async getMembers() {
    try {
      const membersQuery = query(
        collection(db, COLLECTIONS.MEMBERS),
        where('tripId', '==', this.tripId)
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      
      if (membersSnapshot.empty) {
        // Si no hay miembros, crear algunos por defecto
        const defaultMembers = ['Ana', 'Carlos', 'Sofia'];
        const createdMembers = [];
        
        for (const member of defaultMembers) {
          const docRef = await addDoc(collection(db, COLLECTIONS.MEMBERS), {
            name: member,
            tripId: this.tripId,
            createdAt: new Date()
          });
          createdMembers.push({
            id: docRef.id,
            name: member,
            tripId: this.tripId
          });
        }
        return createdMembers;
      }
      
      return membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting members:', error);
      // Fallback con IDs temporales
      return [
        { id: 'temp-1', name: 'Ana', tripId: this.tripId },
        { id: 'temp-2', name: 'Carlos', tripId: this.tripId },
        { id: 'temp-3', name: 'Sofia', tripId: this.tripId }
      ];
    }
  }

  async addMember(memberName) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MEMBERS), {
        name: memberName,
        tripId: this.tripId,
        createdAt: new Date()
      });
      return {
        id: docRef.id,
        name: memberName,
        tripId: this.tripId
      };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  // ========== LISTENERS EN TIEMPO REAL ==========
  onExpensesChange(callback) {
    // Simplificar consulta para evitar índices complejos
    const expensesQuery = query(
      collection(db, COLLECTIONS.EXPENSES),
      where('tripId', '==', this.tripId)
    );
    
    return onSnapshot(expensesQuery, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar en el cliente
      const sortedExpenses = expenses.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date();
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date();
        return dateB - dateA;
      });
      
      callback(sortedExpenses);
    });
  }

  onBudgetChange(callback) {
    const budgetQuery = query(
      collection(db, COLLECTIONS.BUDGETS),
      where('tripId', '==', this.tripId)
    );
    
    return onSnapshot(budgetQuery, (snapshot) => {
      if (!snapshot.empty) {
        const budget = snapshot.docs[0].data();
        callback(budget);
      }
    });
  }
}