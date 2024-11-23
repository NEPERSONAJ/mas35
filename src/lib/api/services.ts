import { supabase } from '../supabase';
import type { Service } from '../types';

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching services:', error);
    throw new Error('Ошибка при загрузке услуг');
  }
  return data;
}

export async function getService(id: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    throw new Error('Ошибка при загрузке услуги');
  }
  return data;
}

export async function createService(service: Omit<Service, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert([{
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image_url: service.image_url,
        is_active: service.is_active
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      throw new Error('Ошибка при создании услуги');
    }
    return data;
  } catch (error) {
    console.error('Create service error:', error);
    throw error;
  }
}

export async function updateService(id: string, service: Partial<Service>) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update({
        ...service,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw new Error('Ошибка при обновлении услуги');
    }
    return data;
  } catch (error) {
    console.error('Update service error:', error);
    throw error;
  }
}

export async function deleteService(id: string) {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      throw new Error('Ошибка при удалении услуги');
    }
  } catch (error) {
    console.error('Delete service error:', error);
    throw error;
  }
}
