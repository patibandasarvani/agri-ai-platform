import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      farmSize: user?.farmSize || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const onProfileUpdate = async (data) => {
    const result = await updateUser(data);
    if (result.success) {
      resetProfile(data);
    }
  };

  const onPasswordChange = async (data) => {
    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      resetPassword();
    }
  };

  const inputFields = [
    {
      name: 'name',
      label: 'Full Name',
      icon: User,
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      icon: Mail,
      type: 'email',
      required: true,
      disabled: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      icon: Phone,
      type: 'tel',
    },
    {
      name: 'location',
      label: 'Location',
      icon: MapPin,
      type: 'text',
    },
    {
      name: 'farmSize',
      label: 'Farm Size (hectares)',
      icon: Home,
      type: 'number',
      step: '0.1',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Profile Settings 👤
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Farmer'}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={field.type}
                          step={field.step}
                          disabled={field.disabled}
                          {...registerProfile(field.name, {
                            required: field.required ? `${field.label} is required` : false,
                          })}
                          className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            profileErrors[field.name]
                              ? 'border-red-500'
                              : field.disabled
                              ? 'bg-gray-100 border-gray-300'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {profileErrors[field.name] && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileErrors[field.name].message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h2>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required',
                      })}
                      className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.role === 'admin' ? 'Administrator' : 'Farmer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className={`text-sm font-medium ${
                    user?.emailVerified ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {user?.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(user?.lastLogin).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
