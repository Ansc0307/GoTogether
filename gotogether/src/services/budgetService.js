import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTIONS = {
  TRIPS: 'trips',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets'
};

export class BudgetService {
  constructor(tripId) {
    this.tripId = tripId;
  }

  // =======================
  // Obtener presupuesto
  // =======================
  async getBudget() {
  try {
    const budgetQuery = query(collection(db, COLLECTIONS.BUDGETS), where('tripId', '==', this.tripId));
    const budgetDocs = await getDocs(budgetQuery);

    if (!budgetDocs.empty) {
      // Si ya existe, devolver el presupuesto existente
      const budgetDoc = budgetDocs.docs[0];
      return { id: budgetDoc.id, ...budgetDoc.data() };
    }

    // 🔹 Si no existe presupuesto, obtener el valor desde el trip
    const tripRef = doc(db, COLLECTIONS.TRIPS, this.tripId);
    const tripSnap = await getDoc(tripRef);
    let tripBudget = 15000; // valor por defecto si el trip no tiene campo budget

    if (tripSnap.exists()) {
      const tripData = tripSnap.data();
      tripBudget = tripData.budget ?? 15000; // usa el valor del trip si existe
    }

    // 🔹 Crear presupuesto nuevo usando el valor del trip
    const defaultBudget = {
      tripId: this.tripId,
      total: tripBudget,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.BUDGETS), defaultBudget);

    // (Opcional) asegurar que el campo trip.budget esté sincronizado
    await updateDoc(tripRef, { budget: tripBudget });

    return { id: docRef.id, ...defaultBudget };

  } catch (error) {
    console.error('Error getting budget:', error);
    return { total: 15000 };
  }
}

  // =======================
  // Actualizar presupuesto
  // =======================
  async updateBudget(newTotal) {
    try {
      const budgetQuery = query(collection(db, COLLECTIONS.BUDGETS), where('tripId', '==', this.tripId));
      const budgetDocs = await getDocs(budgetQuery);

      if (!budgetDocs.empty) {
        const budgetDoc = budgetDocs.docs[0];
        await updateDoc(budgetDoc.ref, { total: newTotal, updatedAt: new Date() });
      }

      // Actualizar también el campo budget en trips
      const tripRef = doc(db, COLLECTIONS.TRIPS, this.tripId);
      await updateDoc(tripRef, { budget: newTotal });

    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // =======================
  // GASTOS
  // =======================
  async getExpenses() {
    try {
      const expensesQuery = query(collection(db, COLLECTIONS.EXPENSES), where('tripId', '==', this.tripId));
      const snapshot = await getDocs(expensesQuery);
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async addExpense(expense) {
    try {
      const newExpense = {
        ...expense,
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
      await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), {
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
      await deleteDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // =======================
  // MIEMBROS
  // =======================
  async getMembers() {
    try {
      const tripSnap = await getDoc(doc(db, COLLECTIONS.TRIPS, this.tripId));
      if (!tripSnap.exists()) return [];
      const members = tripSnap.data().members || [];
      const aliasMap = tripSnap.data().alias || {};

      return members.map(email => ({
        id: email,
        name: email,
        displayName: (aliasMap && aliasMap[email]) ? aliasMap[email] : email
      }));
    } catch (error) {
      console.error('Error getting members:', error);
      return [];
    }
  }

  async addMember(memberName) {
    try {
      const tripRef = doc(db, COLLECTIONS.TRIPS, this.tripId);
      const tripSnap = await getDoc(tripRef);
      if (!tripSnap.exists()) throw new Error('Trip not found');

      const currentMembers = tripSnap.data().members || [];
      if (!currentMembers.includes(memberName)) currentMembers.push(memberName);

      await updateDoc(tripRef, { members: currentMembers });

      return { id: memberName, name: memberName };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  // =======================
  // LISTENERS EN TIEMPO REAL
  // =======================
  onExpensesChange(callback) {
    const expensesQuery = query(collection(db, COLLECTIONS.EXPENSES), where('tripId', '==', this.tripId));
    return onSnapshot(expensesQuery, snapshot => {
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(sorted);
    });
  }

  onBudgetChange(callback) {
    const budgetQuery = query(collection(db, COLLECTIONS.BUDGETS), where('tripId', '==', this.tripId));
    return onSnapshot(budgetQuery, snapshot => {
      if (!snapshot.empty) callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    });
  }
}
