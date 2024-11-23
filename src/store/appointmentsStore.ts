import { create } from 'zustand';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../lib/api/appointments';
import type { Appointment } from '../lib/types';

interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  loading: false,
  error: null,
  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAppointments();
      set({ appointments: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  createAppointment: async (appointment) => {
    set({ loading: true, error: null });
    try {
      await createAppointment(appointment);
      const data = await getAppointments();
      set({ appointments: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  updateAppointment: async (id, appointment) => {
    set({ loading: true, error: null });
    try {
      await updateAppointment(id, appointment);
      const data = await getAppointments();
      set({ appointments: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  deleteAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAppointment(id);
      const data = await getAppointments();
      set({ appointments: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
}));