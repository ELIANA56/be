import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar />
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
};

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '28px 32px',
    overflow: 'auto',
  },
};

export default Layout;
