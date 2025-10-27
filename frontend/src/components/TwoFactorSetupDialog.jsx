import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaShield } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TwoFactorSetupDialog({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Enable, 2: Verify
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeExpiry, setCodeExpiry] = useState(null);

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/api/auth/enable-2fa', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setCodeExpiry(response.data.codeExpiry);
      setStep(2);
      toast.success('Verification code sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5001/api/auth/verify-2fa-setup', {
        code: verificationCode
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Two-factor authentication enabled successfully!');
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setVerificationCode('');
    setCodeExpiry(null);
    onClose();
  };

  const formatExpiry = (expiry) => {
    if (!expiry) return '';
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diff = Math.ceil((expiryDate - now) / (1000 * 60));
    return diff > 0 ? `${diff} minutes` : 'Expired';
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <FaShield className="text-blue-600 mr-2" />
                    Enable Two-Factor Authentication
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>

                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">
                      <p className="mb-3">
                        Two-factor authentication adds an extra layer of security to your account. 
                        When enabled, you'll need to enter a verification code sent to your email 
                        address each time you log in.
                      </p>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                        <ul className="text-blue-800 text-xs space-y-1">
                          <li>• We'll send a 6-digit code to your email</li>
                          <li>• Enter the code to complete login</li>
                          <li>• Your account stays secure even if someone knows your password</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEnable2FA}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Sending...' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">
                      <p className="mb-3">
                        We've sent a 6-digit verification code to your email address. 
                        Please enter it below to complete the setup.
                      </p>
                      
                      {codeExpiry && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-amber-800 text-xs">
                            ⏰ Code expires in: <span className="font-medium">{formatExpiry(codeExpiry)}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest"
                        maxLength={6}
                        autoFocus
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={loading || verificationCode.length !== 6}
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}