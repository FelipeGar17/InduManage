package com.indumanage.indumanage.config;

import com.indumanage.indumanage.model.*;
import com.indumanage.indumanage.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializerProductos {
    
    private final ProductoRepository productoRepository;
    
    @Bean
    @Order(2) // Se ejecuta después de usuarios
    public CommandLineRunner initProductos() {
        return args -> {
            // Solo inicializar si no hay productos
            if (productoRepository.count() > 0) {
                System.out.println("ℹ️ Ya existen productos en la base de datos");
                return;
            }
            
            List<Producto> productos = new ArrayList<>();
            
            // ========== MAQUINARIA GRANDE ==========
            
            productos.add(crearMaquinaria(
                "MAQ-001",
                TipoMaquinaria.GRANDE,
                "Excavadora Caterpillar 320D",
                "Excavadora hidráulica de 20 toneladas, ideal para excavaciones profundas",
                "Excavadoras",
                "Bodega A - Patio 1",
                EstadoMaquinaria.FUNCIONANDO,
                2500.00, // precio por día
                15000.00, // precio por semana
                50000.00, // precio por mes
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fh-cpc.cat.com%2Fcmms%2Fv2%3F%26f%3Dproduct%26it%3Dproduct%26cid%3D406%26lid%3Des%26sc%3DP340%26gid%3D329%26pid%3D16917542%26nc%3D1&psig=AOvVaw2gNlSH2mDfrcuQ2675HWxS&ust=1763792497342000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIDV2KbNgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2021, 3, 15),
                "Motor diesel, brazo de 6.5m, capacidad de cucharón 1.2m³"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-002",
                TipoMaquinaria.GRANDE,
                "Retroexcavadora JCB 3CX",
                "Versátil máquina para carga y excavación",
                "Retroexcavadoras",
                "Bodega A - Patio 1",
                EstadoMaquinaria.FUNCIONANDO,
                1800.00,
                10800.00,
                38000.00,
                "https://www.google.com/imgres?q=retroexcavadora%20jcb%203cx&imgurl=https%3A%2F%2Fcardozeylindo.com%2Fwp-content%2Fuploads%2F2021%2F02%2Fjcb-productos4-1.jpg&imgrefurl=https%3A%2F%2Fcardozeylindo.com%2Fproductos%2Fretroexcavadora-jcb-3cx%2F&docid=dNU2VqQPGZf-GM&tbnid=rGZHG7E25Q2-RM&vet=12ahUKEwj609npzYKRAxVgQTABHTRyB5UQM3oECBYQAA..i&w=450&h=450&hcb=2&ved=2ahUKEwj609npzYKRAxVgQTABHTRyB5UQM3oECBYQAA",
                LocalDate.of(2020, 8, 20),
                "Cargador frontal y retroexcavadora, ideal para obras medianas"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-003",
                TipoMaquinaria.GRANDE,
                "Bulldozer Komatsu D65",
                "Tractor de oruga para movimiento de tierra",
                "Bulldozers",
                "Bodega B - Área 3",
                EstadoMaquinaria.FUNCIONANDO,
                3000.00,
                18000.00,
                60000.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fproduct.global-ce.com%2Fbulldozer%2Fkomatsu%2Ftwxu.html&psig=AOvVaw2yDK4QZOA9weGpg11wnmKQ&ust=1763792740002000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCNCP15HOgpEDFQAAAAAdAAAAABAY",
                LocalDate.of(2019, 11, 5),
                "Hoja recta de 3.8m, potencia 168 HP"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-004",
                TipoMaquinaria.GRANDE,
                "Cargador Frontal Volvo L120",
                "Cargador de ruedas de alta capacidad",
                "Cargadores",
                "Bodega A - Patio 2",
                EstadoMaquinaria.MANTENIMIENTO,
                2200.00,
                13200.00,
                45000.00,
                "https://www.google.com/url?sa=i&url=http%3A%2F%2Fwww.chamanasac.pe%2Fproducto.php%3Fid%3D4&psig=AOvVaw00tgnQ_l7ABeFEFwOYM9Io&ust=1763792817005000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMCcmrfOgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2020, 6, 10),
                "Cucharón de 3.5m³, transmisión automática"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-005",
                TipoMaquinaria.GRANDE,
                "Motoniveladora Caterpillar 140M",
                "Para nivelación y mantenimiento de vías",
                "Motoniveladoras",
                "Bodega B - Área 1",
                EstadoMaquinaria.FUNCIONANDO,
                2800.00,
                16800.00,
                55000.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftracsa.com.mx%2Fproductos%2Fmuevetierra%2Fmotoniveladoras%2Fcat%2F140M&psig=AOvVaw3PJAJy5C0VaQQAkTyktpBz&ust=1763792874305000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLCOitHOgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2021, 1, 25),
                "Hoja de 3.7m, sistema GPS incluido"
            ));
            
            // ========== MAQUINARIA MEDIANA ==========
            
            productos.add(crearMaquinaria(
                "MAQ-006",
                TipoMaquinaria.MEDIANA,
                "Miniexcavadora Bobcat E50",
                "Excavadora compacta para espacios reducidos",
                "Excavadoras",
                "Bodega C - Nivel 1",
                EstadoMaquinaria.FUNCIONANDO,
                800.00,
                4800.00,
                16000.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fjramaquinaria.com%2Fbobcat%2Fexcavadora-compacta-bobcat-e50%2F&psig=AOvVaw14uBireqvEd5QDLhVXqzZE&ust=1763792976159000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKDWvIPPgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2022, 4, 12),
                "Peso operativo 5 ton, ancho 1.8m"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-007",
                TipoMaquinaria.MEDIANA,
                "Rodillo Compactador Bomag BW120",
                "Para compactación de suelos y asfalto",
                "Rodillos",
                "Bodega C - Nivel 2",
                EstadoMaquinaria.FUNCIONANDO,
                1200.00,
                7200.00,
                24000.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Femaresa.cl%2Fproductos%2Frodillo-compactador-bw-120-ad-5-economizer%2F&psig=AOvVaw0ITm0aXt-QwDxGBAfJ8K3V&ust=1763793036877000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKDvtp7PgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2021, 9, 8),
                "Rodillo liso, peso 12 toneladas"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-008",
                TipoMaquinaria.MEDIANA,
                "Minicargador Bobcat S650",
                "Cargador compacto multifuncional",
                "Cargadores",
                "Bodega C - Nivel 1",
                EstadoMaquinaria.REVISION,
                900.00,
                5400.00,
                18000.00,
                "https://www.google.com/imgres?q=Minicargador%20Bobcat%20S650&imgurl=https%3A%2F%2Fwww.lectura-specs.es%2Fmodels%2Frenamed%2Forig%2Fminicargadoras-s-650-bobcat(21).jpg&imgrefurl=https%3A%2F%2Fwww.lectura-specs.es%2Fes%2Fmodelo%2Fmaquinaria-para-la-construccion-y-obras-publicas%2Fminicargadoras-bobcat%2Fs650-1134133&docid=aCSsrKz5T_0mjM&tbnid=nKHhaIg2Aaz1UM&vet=12ahUKEwiTydLKz4KRAxWXZzABHU2GBj4QM3oECBcQAA..i&w=600&h=400&hcb=2&ved=2ahUKEwiTydLKz4KRAxWXZzABHU2GBj4QM3oECBcQAA",
                LocalDate.of(2022, 2, 18),
                "Capacidad de carga 1180 kg, sistema hidráulico"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-009",
                TipoMaquinaria.MEDIANA,
                "Manipulador Telescópico JCB 535-95",
                "Montacargas telescópico todo terreno",
                "Manipuladores",
                "Bodega D - Patio Central",
                EstadoMaquinaria.FUNCIONANDO,
                1500.00,
                9000.00,
                30000.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Frylsa.com.co%2Fproducto%2Fmanipulador-telescopico-535-125-alta-visibilidad%2F&psig=AOvVaw0FkdM3Tf77z1UtQzBwO5vt&ust=1763793210468000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCOjPhPXPgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2020, 12, 5),
                "Alcance 9.5m, capacidad 3500 kg"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-010",
                TipoMaquinaria.MEDIANA,
                "Zanjadora Ditch Witch RT95",
                "Para excavación de zanjas",
                "Zanjas",
                "Bodega D - Área 2",
                EstadoMaquinaria.FUNCIONANDO,
                1000.00,
                6000.00,
                20000.00,
                "https://www.google.com/imgres?q=Zanjadora%20Ditch%20Witch%20RT95&imgurl=http%3A%2F%2Fwww.riegosprogramados.es%2Fwp-content%2Fuploads%2F2015%2F09%2FRT55.png&imgrefurl=http%3A%2F%2Fwww.riegosprogramados.es%2Fditchwitch%2Fzanjadoras%2Fzanjadoras-pesadas%2Frt-55%2F&docid=4srORe70Lp_t5M&tbnid=Nvu0_ZcPpoeyjM&vet=12ahUKEwi-rZuE0IKRAxUZTDABHeALFsAQM3oECDsQAA..i&w=800&h=500&hcb=2&ved=2ahUKEwi-rZuE0IKRAxUZTDABHeALFsAQM3oECDsQAA",
                LocalDate.of(2021, 7, 22),
                "Profundidad máx 2.5m, ancho de zanja 30cm"
            ));
            
            // ========== MAQUINARIA PEQUEÑA ==========
            
            productos.add(crearMaquinaria(
                "MAQ-011",
                TipoMaquinaria.PEQUEÑA,
                "Placa Compactadora Wacker",
                "Compactador manual vibratorio",
                "Compactadores",
                "Bodega E - Estante 1",
                EstadoMaquinaria.FUNCIONANDO,
                150.00,
                900.00,
                3000.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.sermicon.cl%2Fplaca-compactadora-reversible-wacker-dpu-5545-5500-kg-diesel&psig=AOvVaw2lJPBLi_dmsA5G7orwE0iz&ust=1763793306850000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCODruqHQgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2022, 5, 10),
                "Motor Honda 5.5 HP, peso 90 kg"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-012",
                TipoMaquinaria.PEQUEÑA,
                "Martillo Demoledor Bosch GSH 27",
                "Para demolición de concreto y asfalto",
                "Herramientas Eléctricas",
                "Bodega E - Estante 2",
                EstadoMaquinaria.FUNCIONANDO,
                80.00,
                480.00,
                1600.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fmaquitecdecolombia.com%2Fcompra-de%2Fherramienta-electrica%2Fbosch%2Fdemoledor%2Fmartillo-demoledor-gsh-27-vc-combo%2F%3Fsrsltid%3DAfmBOop--31VFf6qXqs0LK8Pk-cggkpWrR6WBsGZbAhql2WDPSbiGbG4&psig=AOvVaw2Fg2kig7zMm5hPAVXL0K6R&ust=1763793384888000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIj9tsTQgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2022, 8, 15),
                "Potencia 2000W, 68 julios, SDS-max"
            ));
            
            productos.add(crearMaquinaria(
                "MAQ-013",
                TipoMaquinaria.PEQUEÑA,
                "Cortadora de Concreto Husqvarna K770",
                "Cortadora manual para concreto",
                "Herramientas Eléctricas",
                "Bodega E - Estante 3",
                EstadoMaquinaria.FUNCIONANDO,
                120.00,
                720.00,
                2400.00,
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fmaquitecdecolombia.com%2Fcompra-de%2Fmaquinaria-liviana%2Fcortadora-de-concreto%2Fcortadora-de-concreto-husqvarna-14-pulgadas-k770%2F%3Fsrsltid%3DAfmBOoqSykvF2YLOk6erERqK2Hrs7vl6NkVu_-tuO0Jb-3PO7bTEuBxF&psig=AOvVaw0Ybm214oGYQX9lFfzgf_vG&ust=1763793427004000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLCPs9nQgpEDFQAAAAAdAAAAABAE",
                LocalDate.of(2022, 3, 20),
                "Motor gasolina 5 HP, disco 14 pulgadas"
            ));
            
            // ========== REPUESTOS ==========
            
            productos.add(crearRepuesto(
                "REP-001",
                "Filtro de Aceite para Excavadora CAT 320",
                "Filtro hidráulico de alta eficiencia",
                "Filtros",
                "Bodega F - Estante A1",
                150,
                45.00,
                "Filtro original CAT, compatible con serie 300"
            ));
            
            productos.add(crearRepuesto(
                "REP-002",
                "Cadena de Oruga para Bulldozer (Metro Lineal)",
                "Eslabones de cadena reforzados",
                "Tren de Rodaje",
                "Bodega F - Área Pesada",
                80,
                320.00,
                "Acero templado, eslabones de 220mm"
            ));
            
            productos.add(crearRepuesto(
                "REP-003",
                "Kit de Sellos Hidráulicos JCB",
                "Set completo de sellos para cilindros",
                "Sistemas Hidráulicos",
                "Bodega F - Estante B2",
                45,
                180.00,
                "Incluye O-rings, retenes y empaques"
            ));
            
            productos.add(crearRepuesto(
                "REP-004",
                "Batería Heavy Duty 12V 200Ah",
                "Batería de ciclo profundo para maquinaria pesada",
                "Eléctricos",
                "Bodega F - Estante C1",
                30,
                420.00,
                "Libre de mantenimiento, garantía 2 años"
            ));
            
            productos.add(crearRepuesto(
                "REP-005",
                "Dientes de Cucharón (Juego de 5)",
                "Puntas intercambiables para excavadora",
                "Accesorios",
                "Bodega F - Estante D3",
                120,
                95.00,
                "Acero boronado, sistema de fijación rápida"
            ));
            
            productos.add(crearRepuesto(
                "REP-006",
                "Manguera Hidráulica Alta Presión 1/2 (Metro)",
                "Manguera flexible reforzada",
                "Sistemas Hidráulicos",
                "Bodega F - Estante E1",
                200,
                28.00,
                "Presión trabajo 350 bar, refuerzo de alambre"
            ));
            
            productos.add(crearRepuesto(
                "REP-007",
                "Bomba de Agua para Motor Diesel",
                "Bomba centrífuga para sistema de enfriamiento",
                "Motores",
                "Bodega F - Estante F2",
                25,
                380.00,
                "Compatible con motores Cummins y Perkins"
            ));
            
            // Guardar todos los productos
            productoRepository.saveAll(productos);
            
            System.out.println("✅ " + productos.size() + " productos de ejemplo creados exitosamente");
            System.out.println("📦 Maquinaria: " + productos.stream().filter(p -> p.getTipo() == TipoProducto.MAQUINARIA).count());
            System.out.println("🔧 Repuestos: " + productos.stream().filter(p -> p.getTipo() == TipoProducto.REPUESTO).count());
        };
    }
    
    // Método auxiliar para crear maquinaria
    private Producto crearMaquinaria(String codigo, TipoMaquinaria tipo, String nombre, 
                                     String descripcion, String categoria, String ubicacion,
                                     EstadoMaquinaria estado, Double precioDia, Double precioSemana,
                                     Double precioMes, String imagenUrl, LocalDate fechaAdquisicion,
                                     String observaciones) {
        Producto producto = new Producto();
        producto.setCodigo(codigo);
        producto.setTipo(TipoProducto.MAQUINARIA);
        producto.setTipoMaquinaria(tipo);
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setCategoria(categoria);
        producto.setUbicacion(ubicacion);
        producto.setEstado(estado);
        producto.setPrecio(precioDia); // Precio base es el diario
        producto.setPrecioAlquilerDia(precioDia);
        producto.setPrecioAlquilerSemana(precioSemana);
        producto.setPrecioAlquilerMes(precioMes);
        producto.setImagenUrl(imagenUrl);
        producto.setFechaAdquisicion(fechaAdquisicion);
        producto.setObservaciones(observaciones);
        producto.setActivo(true);
        producto.setDisponibleVenta(estado == EstadoMaquinaria.FUNCIONANDO);
        producto.setFechaCreacion(LocalDateTime.now());
        producto.setFechaActualizacion(LocalDateTime.now());
        return producto;
    }
    
    // Método auxiliar para crear repuestos
    private Producto crearRepuesto(String codigo, String nombre, String descripcion,
                                   String categoria, String ubicacion, Integer stock,
                                   Double precio, String observaciones) {
        Producto producto = new Producto();
        producto.setCodigo(codigo);
        producto.setTipo(TipoProducto.REPUESTO);
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setCategoria(categoria);
        producto.setUbicacion(ubicacion);
        producto.setStock(stock);
        producto.setStockMinimo(10);
        producto.setPrecio(precio);
        producto.setFechaAdquisicion(LocalDate.now().minusMonths(6));
        producto.setObservaciones(observaciones);
        producto.setActivo(true);
        producto.setDisponibleVenta(stock > 0);
        producto.setFechaCreacion(LocalDateTime.now());
        producto.setFechaActualizacion(LocalDateTime.now());
        return producto;
    }
}
