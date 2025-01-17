import React, { useState } from 'react';
import { agentLogin } from '../../_actions/agent-login'; // Adjust the import path as necessary
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import {storeAgentLoginStatusInCookies} from '../../_actions/agent-login';
import Loader from '../_components/Spinner';
interface AgentLoginProps {
  isOpen: boolean;
  toggleModal: () => void;
}

export default function AgentLogin({ isOpen, toggleModal,  }: AgentLoginProps) {
  // const [email, setEmail] = useState('mithran1@test.com');
  // const [password, setPassword] = useState('admin@12345');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { agentLoginStatus, setAgentLoginStatus, setAgentRole, setAgentName } = useCompareDrawerContext();


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Reset error state
    setLoading(true); // Set loading state
    try {
      const result = await agentLogin(email, password);
      
      if (result.status === 200) {
        console.log(result?.data?.output?.data[0]?.name);
        
        if (result?.data?.output?.data[0]?.status){
          localStorage.setItem('agent_login', 'true');
          setAgentRole(result?.data?.output?.data[0]?.role)
          localStorage.setItem('agent_role', result?.data?.output?.data[0]?.role);
          setAgentLoginStatus(true);
          localStorage.setItem('agent_name', result?.data?.output?.data[0]?.name);
          setAgentName(result?.data?.output?.data[0]?.name)
          toggleModal();
          storeAgentLoginStatusInCookies(true);
          setLoading(false); // Set loading state
        }else{
          localStorage.setItem('agent_login', 'false');
          setAgentLoginStatus(false);
          toggleModal();
          storeAgentLoginStatusInCookies(false);
          setLoading(false); // Set loading state

        }
        
      } else {        
        setError(result?.error ?? null);
        setLoading(false); // Set loading state
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      {/* Backdrop and modal container */}
      <div
        id="authentication-modal"
        tabIndex={-1}
        aria-hidden={!isOpen} // Accessibility
        className={`fixed inset-0 z-100 ${isOpen ? 'flex' : 'hidden'} items-center justify-center overflow-hidden`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Semi-transparent background
      >
        <div className="relative max-h-full w-full max-w-md p-4">
          {/* Modal content */}
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
            {/* Modal header */}
            <div className="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sales Buddy Login
              </h3>
              <button
                type="button"
                className="end-2.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={toggleModal} // Close the modal
              >
                <svg
                  className="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* Modal body */}
            <div className="p-4 md:p-5">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="relative w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  style={{ backgroundColor: 'blue', color: 'white' }} // Temporary debug style
                >
                  Login to your account
                  <div className="absolute inset-0 flex items-center justify-center">
                    {loading && <Loader />}
                  </div>
                </button>
                {/* <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Not registered?{' '}
                  <a href="#" className="text-blue-700 hover:underline dark:text-blue-500">
                    Create account
                  </a>
                </div> */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
