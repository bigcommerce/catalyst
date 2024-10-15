
"use client"; 

import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
const Dropdown: React.FC = () => {
    const t = useTranslations('productDetailDropdown');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Ref for the "Product Details" button

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close dropdown and set focus to the button
  const closeDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to avoid unexpected behaviors
    setIsOpen(false);
    if (buttonRef.current) {
      buttonRef.current.focus(); // Set focus back to the "Product Details" button
    }
  };

  // Handle clicks outside the dropdown
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  // Add event listener for clicks outside
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`mt-6 xl:mt-12 relative inline-block w-full transition-all duration-300`}
      ref={dropdownRef}
    >
      <button
        ref={buttonRef} // Assign ref to the button
        className="flex items-center cursor-pointer relative w-full text-left border border-gray-300 rounded py-4 px-6"
        onClick={toggleDropdown}
      >
        <span className="flex-grow text-center uppercase text-[0.875rem] font-semibold text-[#002A37]">
      {t("productDetails")}
        </span>
        <svg
          className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`transition-max-height duration-300 overflow-hidden ${isOpen ? "max-h-[1600px]" : "max-h-0"}`}
        style={{ transitionTimingFunction: "ease" }}
      >
        {isOpen && (
          <div className="bg-white shadow-lg border border-gray-300 rounded mt-6 p-8 w-full">
            {/* Product details content */}
            <div className="flex justify-between items-center mb-2" style={{ fontSize: "18px" }}>
              <span className="mt-4 mb-2 text-lg font-semibold" style={{ fontSize: "18px" }}>
              {t("whatsInTheBox")}
              </span>
              <span style={{ fontSize: "14px" }}>{t("sku")}</span>
            </div>
            <div className="mt-2 text-gray-700" style={{ fontSize: "14px" }}>
              <span>{t("canopy")}</span> <span>|</span> <span>{t("shade")}</span> <span>|</span> <span>{t("rod2to6")}</span>{" "}
              <span>|</span> <span>{t("rod2to12")}</span>
            </div>
            <div className="mt-4">
              <button className="w-full flex items-center justify-center bg-[#008BB7] text-white py-2 px-4 rounded mb-2 text-sm">
                <img
                  alt="Download spec sheet"
                  src="https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/icons8-download-symbol-16.png?t=1726210410"
                  height={16}
                  width={16}
                />
                <span className="ml-2">{t("downloadSpecSheet")}</span>
              </button>

              <button className="w-full flex items-center justify-center border border-gray-300 py-2 px-4 rounded text-sm">
                <img
                  alt="Download installation sheet"
                  src="https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/icons8-download-symbol-16-1-.png?t=1726210403"
                  height={16}
                  width={16}
                />
                <span className="ml-2">{t("installationSheet")}</span>
              </button>
            </div>
            <h2 className="mt-4 mb-2 text-lg font-semibold" style={{ fontSize: "18px" }}>
             {t("dimensionsAndWeights")}
             </h2>
            <div className="mt-4 w-full border border-gray-300 flex justify-center items-center" style={{ textAlign: "center" }}>
              <div className="border-gray-300 p-4">
                <img
                  src="https://cdn11.bigcommerce.com/s-ij3bmi5w7y/images/stencil/320w/image-manager/pdp-lamp-img.jpg?t=1725341763"
                  alt="Dimensions and weights"
                  style={{ maxWidth: "100%", height: "auto", display: "block" }}
                />
              </div>
            </div>
            <table className="mt-4 w-full border-collapse text-base" style={{ fontSize: "16px" }}>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: "30%" }}>
                   {t("widthDiameter")}
                  </td>
                  <td className="border p-2" style={{ width: "70%" }}>
                  {t("Eighteen")}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: "30%" }}>
                  {t("height")}
                  </td>
                  <td className="border p-2" style={{ width: "70%" }}>
                     {t("725")}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: "30%" }}>
                   {t("depthExtension")}
                  </td>
                  <td className="border p-2" style={{ width: "70%" }}>
                 {t("Eighteen")}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: "30%" }}>
                  {t("canopyWidth")}
                  </td>
                  <td className="border p-2" style={{ width: "70%" }}>
                  {t("fourteen")}
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Add more product information here */}
            <h2 className="mt-4 mb-2 text-lg font-semibold" style={{ fontSize: "18px" }}>
             {t("installationDetails")}
            </h2>
            <table className="w-full border-collapse text-base" style={{ fontSize: "16px" }}>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: "30%" }}>
                  {t("wireLength")}
                  </td>
                  <td className="border p-2" style={{ width: "70%" }}>
                 {t("onetwenty")}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: "30%" }}>
                {t("chainLength")}
                  </td>
                  <td className="border p-2" style={{ width: "70%" }}>
                  {t("twelve")} 
                  </td>
                </tr>
              </tbody>
            </table>
            <h2 className="mt-4 mb-2 text-lg font-semibold" style={{ fontSize: '18px' }}>  {t("Lamping")} </h2>
          <table className="w-full border-collapse text-base" style={{ fontSize: '16px' }}>
            <tbody>
              <tr>
                <td className="border p-2" style={{ width: '30%' }}>{t("numberOfBulbs")}</td>
                <td className="border p-2" style={{ width: '70%' }}>{t("one")}</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ width: '30%' }}>{t("numberOfBulbs")}</td>
                <td className="border p-2" style={{ width: '70%' }}>{t("standardWattage")}</td>
              </tr>
            </tbody>
          </table>
          <h2 className="mt-4 mb-2 text-lg font-semibold" style={{ fontSize: '18px' }}>{t("compatibilityAndSmartFeatures")}</h2>
          <table className="w-full border-collapse text-base" style={{ fontSize: '16px' }}>
            <tbody>
              <tr>
                <td className="border p-2" style={{ width: '30%' }}>{t("smartCompatible")}</td>
                <td className="border p-2" style={{ width: '70%' }}>{t("smartCompatibleText")}</td>
              </tr>
            </tbody>
          </table>
          <h2 className="mt-4 mb-2 text-lg font-semibold" style={{ fontSize: '18px' }}>{t("productDetailHeading")}</h2>
          <table className="w-full border-collapse text-base" style={{ fontSize: '16px' }}>
            <tbody>
              <tr>
                <td className="border p-2" style={{ width: '30%' }}>{t("finishes")}</td>
                <td className="border p-2" style={{ width: '70%' }}>{t("finishesText")}</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ width: '30%' }}>{t("smartCompatible")}</td>
                <td className="border p-2" style={{ width: '70%' }}>{t("glass")}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-center underline text-base" style={{ fontSize: '16px' }}>{t("warning")}</div>
           
           
           
            <button
              className="mt-4 w-full flex items-center justify-center text-sm text-[#002A37]  flex items-centertext-left border border-gray-300 rounded py-4 px-6"
              onClick={closeDropdown} // Close the dropdown on click
            >
             <span className="flex-grow text-center uppercase text-[0.875rem] font-semibold text-[#002A37]">
             {t("closeDetails")}
             </span>
         
              <svg
          className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
            </button>


          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;