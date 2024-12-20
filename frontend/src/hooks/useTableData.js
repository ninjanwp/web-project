import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const useTableData = (endpoint, defaultItemsPerPage = 10) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const responseData = await api.list(endpoint);
      const data = Array.isArray(responseData) ? responseData : responseData.data || [];
      setData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(data);
    } else {
      const searchResults = data.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredData(searchResults);
    }
    setCurrentPage(1);
  }, [data]);

  const handleSort = useCallback((sortValue) => {
    if (!sortValue) return;
    
    // Parse the sort value string (e.g., "price-asc" -> { field: "price", direction: "asc" })
    const [field, direction] = sortValue.split('-');
    
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Convert to numbers for numeric fields
      if (field === 'price' || field === 'stock' || field === 'total') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredData(sortedData);
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    data: paginatedData,
    isLoading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData,
    sortField,
    sortDirection,
    searchTerm
  };
};

export default useTableData; 