import { useState, useCallback } from 'react';
import { functions } from '../lib/appwrite.js';

const FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_MANAGE_USERS;

async function callManageUsers(method, path, body = null) {
  const params = {
    functionId: FUNCTION_ID,
    method,
    xpath: path,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) params.body = JSON.stringify(body);

  const execution = await functions.createExecution(params);
  const response = JSON.parse(execution.responseBody);

  if (execution.responseStatusCode >= 400) {
    throw new Error(response.error || 'Terjadi kesalahan.');
  }
  return response;
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (search = '', limit = 25, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const qs = params.toString();
      const result = await callManageUsers('GET', `/users?${qs}`);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data) => {
    const result = await callManageUsers('POST', '/users', data);
    return result;
  }, []);

  const updateUser = useCallback(async (id, data) => {
    const result = await callManageUsers('PATCH', `/users/${id}`, data);
    return result;
  }, []);

  const deleteUser = useCallback(async (id) => {
    const result = await callManageUsers('DELETE', `/users/${id}`);
    return result;
  }, []);

  return { users, total, loading, error, fetchUsers, createUser, updateUser, deleteUser };
}
