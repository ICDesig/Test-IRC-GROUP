import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import userService from "../services/userService";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import UserModal from "../components/UserModal";

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    is_active: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.current_page]);
  const handleResetFilters = () => {
    setFilters({
      search: "",
      role: "",
      is_active: "",
    });
    setPagination({ ...pagination, current_page: 1 });
  };
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters,
      };

      const response = await userService.getAll(params);
      console.log("Données reçues:", response.data);

      // ✅ CORRECTION : response.data contient DIRECTEMENT la pagination Laravel
      const paginationData = response.data;

      // Vérifier que la structure est correcte
      if (paginationData && Array.isArray(paginationData.data)) {
        // Mettre à jour les utilisateurs
        setUsers(paginationData.data);

        // Mettre à jour la pagination
        setPagination({
          current_page: paginationData.current_page,
          per_page: paginationData.per_page,
          total: paginationData.total,
          last_page: paginationData.last_page,
        });

        console.log(
          `✅ ${paginationData.data.length} utilisateur(s) chargé(s)`,
        );
      } else {
        console.error("❌ Structure de données invalide:", paginationData);
        toast.error("Structure de données invalide");
      }
    } catch (error) {
      console.error("❌ Erreur de chargement:", error);
      console.error("Détails:", error.response?.data);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination({ ...pagination, current_page: 1 });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer ${user.first_name} ${user.last_name} ?`,
      )
    ) {
      return;
    }

    try {
      await userService.delete(user.id);
      toast.success("Utilisateur supprimé avec succès");
      loadUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    setSelectedUser(null);
    if (refresh) {
      loadUsers();
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, current_page: newPage });
  };

  const getRoleBadge = (role) => {
    const configs = {
      admin: { label: "👑 Administrateur", class: "bg-blue-100 text-blue-700" },
      manager: { label: "📊 Manager", class: "bg-purple-100 text-purple-700" },
      employee: { label: "👤 Employé", class: "bg-green-100 text-green-700" },
    };
    const config = configs[role];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive, hasPassword) => {
    if (!hasPassword) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          🔐 En attente
        </span>
      );
    }
    return isActive ? (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        ✅ Actif
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        ⛔ Inactif
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600">Liste complète des collaborateurs</p>
          </div>
          {isAdmin() && (
            <button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              Ajouter un utilisateur
            </button>
          )}
        </div>

        {/* Filters */}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              🔍 Filtres de recherche
            </h2>
            <button
              onClick={handleResetFilters}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
            >
              <span>🔄</span>
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="search"
              placeholder="🔍 Rechercher par nom, login, email..."
              value={filters.search}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />

            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">🎯 Tous les rôles</option>
              <option value="admin">👑 Administrateur</option>
              <option value="manager">📊 Manager</option>
              <option value="employee">👤 Employé</option>
            </select>

            <select
              name="is_active"
              value={filters.is_active}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">📊 Tous les statuts</option>
              <option value="1">✅ Actif</option>
              <option value="0">⛔ Inactif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                Chargement des utilisateurs...
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Nom complet
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Login
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Téléphone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Poste
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Département
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Rôle
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">
                            {user.first_name} {user.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                            @{user.login}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.email || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.phone || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.position || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.department || "-"}
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(user.is_active, user.has_password)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-all text-sm font-medium"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-all text-sm font-medium"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  ← Précédent
                </button>
                <span className="text-gray-700 font-medium">
                  Page {pagination.current_page} sur {pagination.last_page}
                  <span className="text-gray-500 ml-2">
                    ({pagination.total} utilisateurs)
                  </span>
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}

        {showModal && (
          <UserModal user={selectedUser} onClose={handleModalClose} />
        )}
      </div>
    </Layout>
  );
};

export default Users;
