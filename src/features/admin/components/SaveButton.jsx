import React from 'react';
import PropTypes from 'prop-types';
import { FiSave } from 'react-icons/fi';

const SaveButton = ({ isSaving, label, icon }) => (
  <button
    type="submit"
    disabled={isSaving}
    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
  >
    {icon}
    {isSaving ? 'Saving...' : label}
  </button>
);

SaveButton.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  label: PropTypes.string,
  icon: PropTypes.node,
};

SaveButton.defaultProps = {
  label: 'Save Changes',
  icon: <FiSave size={14} />,
};

export default SaveButton;
