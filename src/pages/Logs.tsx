import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { LogEntry } from '../types';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import TableContainer from '../components/ui/TableContainer';
import { Loader2, FileText, Table2, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last7days');

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      toast.error('Error al cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (logs.length === 0) {
      toast.error('No hay registros para descargar');
      return;
    }

    if (format === 'csv' || format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(logs);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
      const fileName = `logs_${dateRange}.${format}`;
      XLSX.writeFile(workbook, fileName);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const formattedData = logs.map((log) => [
        log.task_reference,
        log.previous_status || '-',
        log.new_status,
        log.user_email,
        format(new Date(log.timestamp), "d MMM yyyy HH:mm", { locale: es }),
      ]);
      doc.autoTable({
        head: [['Referencia', 'Estado Anterior', 'Estado Nuevo', 'Usuario', 'Fecha']],
        body: formattedData,
      });
      doc.save(`logs_${dateRange}.pdf`);
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'Taller':
        return 'bg-yellow-100 text-yellow-800';
      case 'Presupuesto':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente de repuesto':
        return 'bg-red-100 text-red-800';
      case 'Hecho':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Registros</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="last7days">Últimos 7 días</option>
            <option value="last30days">Últimos 30 días</option>
            <option value="lastYear">Último año</option>
          </Select>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('csv')}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('xlsx')}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <Table2 className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('pdf')}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <TableContainer>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Nuevo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.task_reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.previous_status ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.previous_status)}`}>
                        {log.previous_status}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.new_status)}`}>
                      {log.new_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.user_name}
                    <span className="block text-xs text-gray-400">
                      {log.user_email}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.timestamp), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    <span className="block text-xs text-gray-400">
                      {format(new Date(log.timestamp), "HH:mm", { locale: es })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableContainer>
    </div>
  );
}
