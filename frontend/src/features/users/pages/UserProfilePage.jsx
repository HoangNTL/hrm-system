import React from 'react';

import ChangePasswordModal from '../components/profile/ChangePasswordModal.jsx';
import PersonalInfoTab from '../components/profile/PersonalInfoTab.jsx';
import ProfileCard from '../components/profile/ProfileCard.jsx';
import SecurityTab from '../components/profile/SecurityTab.jsx';
import WorkInfoTab from '../components/profile/WorkInfoTab.jsx';
import { useUserProfile } from '../hooks/useUserProfile.js';

export default function UserProfilePage() {
  const {
    user,
    profile,
    loading,
    activeTab,
    editing,
    editData,
    showPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    pwdForm,
    setActiveTab,
    setEditing,
    setShowPassword,
    handleSaveProfile,
    handleCancelEdit,
    handleEditDataChange,
    handleChangePassword,
    handlePasswordFormChange,
    togglePasswordVisibility,
    getInitials,
  } = useUserProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="w-80 flex-shrink-0">
        <ProfileCard
          initials={getInitials()}
          profile={profile}
          editing={editing}
          onEditClick={() => setEditing(true)}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
      </div>

      <div className="flex-1">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
          <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
              Information
            </h1>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {user?.role} • {profile?.employee?.department?.name || 'N/A'}
            </p>
          </div>

          <div className="flex gap-0 border-b border-secondary-200 dark:border-secondary-700 px-6">
            {['personal', 'work', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 font-medium transition-colors border-b-2 capitalize ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
                }`}
              >
                {tab === 'personal'
                  ? 'Personal Information'
                  : tab === 'work'
                    ? 'Work Information'
                    : 'Security'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'personal' && (
              <PersonalInfoTab
                profile={profile}
                editing={editing}
                editData={editData}
                onEditDataChange={handleEditDataChange}
              />
            )}

            {activeTab === 'work' && <WorkInfoTab profile={profile} />}

            {activeTab === 'security' && (
              <SecurityTab
                profile={profile}
                onChangePasswordClick={() => setShowPassword(true)}
              />
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPassword}
        profile={profile}
        pwdForm={pwdForm}
        showCurrentPassword={showCurrentPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        onClose={() => setShowPassword(false)}
        onSubmit={handleChangePassword}
        onPasswordFormChange={handlePasswordFormChange}
        onTogglePasswordVisibility={togglePasswordVisibility}
      />
    </div>
  );
}
