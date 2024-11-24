import React, { useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import DataTable from "../components/common/DataTable";
import useTableData from "../hooks/useTableData";
import api from "../services/api";
import ProductModal from "../components/ProductModal";

const ProductsPage = () => {
  const {
    data,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData,
    sortField,
    sortOrder,
  } = useTableData("products");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const columns = [
    { field: "id", label: "ID" },
    { field: "name", label: "Name" },
    { field: "description", label: "Description" },
    {
      field: "price",
      label: "Price",
      format: (value) => `$${Number(value).toFixed(2)}`,
      className: "text-end",
    },
    {
      field: "stock",
      label: "Stock",
      className: "text-end",
    },
    {
      field: "actions",
      label: "",
      className: "text-center",
      format: (_, item) => (
        <Button
          variant="outline-primary"
          size="sm"
          className="btn-edit"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          <i className="bi bi-pencil"></i>
        </Button>
      ),
    },
  ];

  const sortOptions = [
    { field: "name", direction: "asc", label: "Name (A-Z)" },
    { field: "name", direction: "desc", label: "Name (Z-A)" },
    { field: "price", direction: "desc", label: "Price (High-Low)" },
    { field: "price", direction: "asc", label: "Price (Low-High)" },
    { field: "stock", direction: "desc", label: "Stock (High-Low)" },
    { field: "stock", direction: "asc", label: "Stock (Low-High)" }
  ];

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      await api.updateProduct(updatedProduct.id, updatedProduct);
      setShowEditModal(false);
      setEditProduct(null);
      refreshData();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await api.deleteProducts(selectedProducts);
      setSelectedProducts([]);
      refreshData();
    } catch (error) {
      console.error("Error deleting products:", error);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      await api.createProduct(product);
      setShowAddModal(false);
      refreshData();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleRowClick = (item) => {
    setSelectedProducts((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProducts([id]);
      setShowEditModal(false);
      setEditProduct(null);
      refreshData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <DataTable
        title={<><i className="bi bi-box-seam me-2"></i>Products</>}
        columns={columns}
        data={data}
        actionButton={
          <Button 
            variant="outline-primary" 
            onClick={() => setShowAddModal(true)}
            className="d-inline-flex align-items-center"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Product
          </Button>
        }
        selectedProducts={selectedProducts}
        onDeleteSelected={handleDeleteSelected}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onSort={handleSort}
        sortOptions={sortOptions}
        onSearch={handleSearch}
        onRowClick={handleRowClick}
        sortField={sortField}
        sortOrder={sortOrder}
        selectable={true}
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
      />

      <ProductModal
        show={showAddModal || showEditModal}
        product={editProduct}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditProduct(null);
        }}
        onSubmit={editProduct ? handleUpdateProduct : handleAddProduct}
        onDelete={handleDeleteProduct}
      />
    </>
  );
};

export default ProductsPage;