import { useState, useEffect } from 'react';
import { clientesService } from '../services/clientes.service';
import { eventosService } from '../services/eventos.service';
import type { Cliente, TipoCliente } from '../types';
import './EventoForm.css';

interface EventoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FiltroDestinatarios = 'todos' | 'hogar' | 'negocios' | 'ciudad' | 'tipo' | 'personalizado';

const TIPOS_NEGOCIO: TipoCliente[] = ['tienda', 'asadero', 'restaurante_estandar', 'restaurante_premium', 'mayorista'];

export function EventoForm({ onClose, onSuccess }: EventoFormProps) {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroDestinatarios>('todos');
  const [ciudadesSeleccionadas, setCiudadesSeleccionadas] = useState<string[]>([]);
  const [tiposSeleccionados, setTiposSeleccionados] = useState<TipoCliente[]>([]);
  const [telefonosPersonalizados, setTelefonosPersonalizados] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll();
      setClientes(data);
      
      // Extraer ciudades únicas
      const ciudadesUnicas = Array.from(
        new Set(data.map(c => c.ciudad).filter(Boolean) as string[])
      ).sort();
      setCiudades(ciudadesUnicas);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCiudad = (ciudad: string) => {
    setCiudadesSeleccionadas(prev =>
      prev.includes(ciudad)
        ? prev.filter(c => c !== ciudad)
        : [...prev, ciudad]
    );
  };

  const toggleTipo = (tipo: TipoCliente) => {
    setTiposSeleccionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const calcularDestinatarios = (): number => {
    switch (filtro) {
      case 'todos':
        return clientes.length;
      case 'hogar':
        return clientes.filter(c => c.tipoCliente === 'hogar').length;
      case 'negocios':
        return clientes.filter(c => c.tipoCliente !== 'hogar').length;
      case 'ciudad':
        return clientes.filter(c => ciudadesSeleccionadas.includes(c.ciudad || '')).length;
      case 'tipo':
        return clientes.filter(c => tiposSeleccionados.includes(c.tipoCliente)).length;
      case 'personalizado':
        return telefonosPersonalizados.split(',').filter(t => t.trim()).length;
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() || !mensaje.trim()) {
      alert('❌ Por favor completa nombre y mensaje');
      return;
    }

    const destinatariosCount = calcularDestinatarios();
    if (destinatariosCount === 0) {
      alert('❌ No hay destinatarios con los filtros seleccionados');
      return;
    }

    if (!confirm(`¿Enviar evento "${nombre}" a ${destinatariosCount} destinatarios?`)) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('mensaje', mensaje);
      
      // Preparar filtros
      const filtrosData: any = {
        tipo: filtro,
      };

      if (filtro === 'ciudad' && ciudadesSeleccionadas.length > 0) {
        filtrosData.ciudades = ciudadesSeleccionadas;
      } else if (filtro === 'tipo' && tiposSeleccionados.length > 0) {
        filtrosData.tiposCliente = tiposSeleccionados;
      } else if (filtro === 'personalizado') {
        const telefonos = telefonosPersonalizados
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
        filtrosData.telefonos = telefonos;
      }
      
      formData.append('filtros', JSON.stringify(filtrosData));
      
      if (imagen) {
        formData.append('imagen', imagen);
      }

      console.log('📤 Enviando evento...');
      const response = await eventosService.crear(formData);
      console.log('✅ Respuesta recibida:', response);
      
      alert(`✅ Evento enviado exitosamente\n\n` +
            `📊 Enviados: ${response.data?.destinatarios?.enviados || 0}\n` +
            `❌ Fallidos: ${response.data?.destinatarios?.fallidos || 0}`);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      const errorMsg = error?.message || 'Error desconocido al crear el evento';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content evento-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header evento-header">
          <div>
            <h3>📢 Crear Evento Masivo</h3>
            <p className="header-subtitle">Envía mensajes a múltiples clientes</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="evento-form">
          {/* Información básica */}
          <div className="form-section">
            <h4>Información del Evento</h4>
            <div className="form-group">
              <label>Nombre del Evento *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Promoción Navidad 2024"
                required
              />
            </div>

            <div className="form-group">
              <label>Mensaje *</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe el mensaje que se enviará a los clientes..."
                rows={4}
                required
              />
              <div className="char-count">{mensaje.length} caracteres</div>
            </div>

            <div className="form-group">
              <label>Imagen (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagenPreview && (
                <div className="image-preview">
                  <img src={imagenPreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setImagen(null);
                      setImagenPreview(null);
                    }}
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Destinatarios */}
          <div className="form-section">
            <h4>Destinatarios</h4>
            <div className="filtros-grid">
              <button
                type="button"
                className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltro('todos')}
              >
                Todos los Clientes
              </button>
              <button
                type="button"
                className={`filtro-btn ${filtro === 'hogar' ? 'active' : ''}`}
                onClick={() => setFiltro('hogar')}
              >
                Solo Hogar
              </button>
              <button
                type="button"
                className={`filtro-btn ${filtro === 'negocios' ? 'active' : ''}`}
                onClick={() => setFiltro('negocios')}
              >
                Solo Negocios
              </button>
              <button
                type="button"
                className={`filtro-btn ${filtro === 'ciudad' ? 'active' : ''}`}
                onClick={() => setFiltro('ciudad')}
              >
                Por Ciudad
              </button>
              <button
                type="button"
                className={`filtro-btn ${filtro === 'tipo' ? 'active' : ''}`}
                onClick={() => setFiltro('tipo')}
              >
                Por Tipo de Negocio
              </button>
              <button
                type="button"
                className={`filtro-btn ${filtro === 'personalizado' ? 'active' : ''}`}
                onClick={() => setFiltro('personalizado')}
              >
                Personalizado
              </button>
            </div>

            {filtro === 'ciudad' && (
              <div className="selector-container">
                <p className="selector-label">Selecciona las ciudades:</p>
                <div className="checkboxes-grid">
                  {ciudades.map(ciudad => (
                    <label key={ciudad} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={ciudadesSeleccionadas.includes(ciudad)}
                        onChange={() => toggleCiudad(ciudad)}
                      />
                      <span>{ciudad}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {filtro === 'tipo' && (
              <div className="selector-container">
                <p className="selector-label">Selecciona los tipos de negocio:</p>
                <div className="checkboxes-grid">
                  {TIPOS_NEGOCIO.map(tipo => (
                    <label key={tipo} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={tiposSeleccionados.includes(tipo)}
                        onChange={() => toggleTipo(tipo)}
                      />
                      <span>{tipo.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {filtro === 'personalizado' && (
              <div className="form-group">
                <label>Teléfonos (separados por coma)</label>
                <textarea
                  value={telefonosPersonalizados}
                  onChange={(e) => setTelefonosPersonalizados(e.target.value)}
                  placeholder="573001234567, 573009876543, ..."
                  rows={3}
                />
              </div>
            )}

            <div className="destinatarios-count">
              <span className="count-icon">👥</span>
              <span className="count-text">
                Este evento se enviará a <strong>{calcularDestinatarios()}</strong> destinatarios
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Enviando...' : '📤 Enviar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
