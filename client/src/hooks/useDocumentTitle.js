import { useEffect } from 'react';

/**
 * Custom hook to update document title and meta description dynamically
 * @param {string} title - Page specific title (if 'CivicLens' or exact=true, title becomes exact string)
 * @param {string} [description] - Optional meta description override
 * @param {boolean} [exact=false] - Whether to set the exact title without suffix
 */
export const useDocumentTitle = (title, description, exact = false) => {
  useEffect(() => {
    if (!title || title === 'CivicLens' || exact) {
      document.title = title || 'CivicLens';
    } else {
      document.title = `${title} | CivicLens`;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }
  }, [title, description, exact]);
};

export default useDocumentTitle;
