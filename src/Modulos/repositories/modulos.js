

// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getMenuPai = async (idModulo) => {
    let query = `
        SELECT 
            IDMENU, 
            STATIVO, 
            IDMODULO, 
            DSMENU 
        FROM "${databaseSchema}".MENUPAI
            WHERE IDMODULO = ?
    `;

    const params = [idModulo];

    const statement = await conn.prepare(query);
    const result = await statement.exec(params);
    if (!Array.isArray(result) || result.length === 0) return [];

    const data = result.map((item, index) => ({
        IDMENU: item.IDMENU,
        STATIVO: item.STATIVO,
        IDMODULO: item.IDMODULO,
        DSMENU: item.DSMENU
    }))

    return data;
}

export const getMenuFilho = async (idMenuPai, idMenuFilho) => {

    let query = `
       SELECT 
            ID, 
            DSNOME, 
            IDMENUPAI, 
            URL, 
            ALTERAR, 
            CRIAR, 
            VISUALIZAR, 
            N1,
            N2,
            N3,
            N4,
            ADMINISTRADOR
        FROM ${databaseSchema}.MENUFILHO
        WHERE 1 = 1
    `;


    const params = [];

    if(idMenuPai) {
        query += ` AND IDMENUPAI = ?`;
        params.push(idMenuPai);
    }

    if (idMenuFilho) {
        query += ` AND ID IN (?)`;
        params.push(idMenuFilho);
    }

    query += ` ORDER BY ID ASC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(1000, 0);
  
    const statement = await conn.prepare(query);
    const result = await statement.exec(params);
    
    if (!Array.isArray(result) || result.length === 0) return [];

    const data = result.map((item, index) => ({
        ID: item.ID,
        DSNOME: item.DSNOME,
        IDMENUPAI: item.IDMENUPAI,
        URL: item.URL,
        ALTERAR: item.ALTERAR,
        CRIAR: item.CRIAR,
        VISUALIZAR: item.VISUALIZAR,
        N1: item.N1,
        N2: item.N2,
        N3: item.N3,
        N4: item.N4,
        ADMINISTRADOR: item.ADMINISTRADOR
    }))

    return data;
}

export const getModuloPrincipal = async (idModulo) => {
    const query = `SELECT * FROM ${databaseSchema}.MODULOPRINCIPAL WHERE ID = ?`;
    const params = [idModulo];
    const statement = await conn.prepare(query);
    
    const result = await statement.exec(params);

    return Array.isArray(result) ? result : [];
};

export const getPerfilUsuarioMenu = async (idUsuario, idModulo, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 500;

        let query = `
            SELECT DISTINCT
                IDUSUARIO, 
                DSPERFIL, 
                CRIAR, 
                ALTERAR, 
                STATIVO, 
                IDPERFILUSUARIO, 
                IDMODULO, 
                IDMODULOADMINISTRATIVO, 
                IDMODULOCOMERCIAL, 
                IDMODULOCONTABILIDADE, 
                IDMODULOFINANCEIRO, 
                IDMODULOGERENCIA, 
                IDMODULOINFORMATICA, 
                IDMODULOMARKETING, 
                IDMODULOCOMPRAS, 
                IDMODULOCADASTRO, 
                IDMODULOEXPEDICAO, 
                IDMODULOCOMPRASADM, 
                IDMODULOETIQUETAGEM, 
                IDMODULOCONFERENCIACEGA, 
                IDMODULOVOUCHER, 
                IDMODULOMALOTE, 
                IDMODULORH, 
                IDUSERULTIMAALTERACAO, 
                IDPERMISSAO, 
                IDMODULORESUMOVENDAS, 
                IDMODULOPROMOCAO,
                ADMINISTRADOR, 
                N4, 
                N3, 
                N2, 
                N1,
                IDMENUFILHO,
                IDMENU
            FROM ${databaseSchema}.PERFILUSUARIOMENU 
            WHERE IDUSUARIO = ?
         
        `;

        const params = [idUsuario];
        if (idModulo) {
        
            query += `
                AND (
                    IDMODULO = ?
                    OR IDMODULOADMINISTRATIVO = ?
                    OR IDMODULOCOMERCIAL = ?
                    OR IDMODULOCONTABILIDADE = ?
                    OR IDMODULOFINANCEIRO = ?
                    OR IDMODULOGERENCIA = ?
                    OR IDMODULOINFORMATICA = ?
                    OR IDMODULOMARKETING = ?
                    OR IDMODULOCOMPRAS = ?
                    OR IDMODULOCADASTRO = ?
                    OR IDMODULOEXPEDICAO = ?
                    OR IDMODULOCOMPRASADM = ?
                    OR IDMODULOETIQUETAGEM = ?
                    OR IDMODULOCONFERENCIACEGA = ?
                    OR IDMODULOVOUCHER = ?
                    OR IDMODULOMALOTE = ?
                    OR IDMODULORH = ?
                    OR IDPERMISSAO = ?
                    OR IDMODULORESUMOVENDAS = ?
                    OR IDMODULOPROMOCAO = ?
                )
            `;
          
            for (let i = 0; i < 20; i++) {
                params.push(idModulo);
            }
        }    

        query += ` ORDER BY IDUSUARIO, IDMENUFILHO`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, (page - 1) * pageSize);
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if (!Array.isArray(result) || result.length === 0) return [];

 
        const usuariosAgrupados = new Map();

        for (const item of result) {
            if (!usuariosAgrupados.has(item.IDUSUARIO)) {
                usuariosAgrupados.set(item.IDUSUARIO, {
                    ...item,
                    modulos: new Map() // Evita duplicação de módulos
                });
            }

            const usuario = usuariosAgrupados.get(item.IDUSUARIO);
            const modulosAcesso = [
                item.IDMODULOADMINISTRATIVO,
                item.IDMODULOGERENCIA,
                item.IDMODULOINFORMATICA,
                item.IDMODULOFINANCEIRO,
                item.IDMODULOMARKETING,
                item.IDMODULORH,
                item.IDMODULOCOMERCIAL,
                item.IDMODULOCOMPRAS,
                item.IDMODULOCONTABILIDADE,
                item.IDMODULOCOMPRASADM,
                item.IDMODULOEXPEDICAO,
                item.IDMODULOCONFERENCIACEGA,
                item.IDMODULOCADASTRO,
                item.IDMODULOETIQUETAGEM,
                item.IDMODULORESUMOVENDAS,
                item.IDMODULOVOUCHER,
                item.IDMODULOMALOTE,
                item.IDPERMISSAO,
                item.IDMODULOPROMOCAO
            ].filter(Boolean);

            for (const idModulo of modulosAcesso) {
                if (!usuario.modulos.has(idModulo)) {
                    const modulo = await getModuloPrincipal(idModulo);
                    if (!modulo[0]) continue;

                    const menuPai = await getMenuPai(modulo[0].IDMENU);
                    if (!menuPai[0]) continue;

                    usuario.modulos.set(idModulo, {
                        ...modulo[0],
                        menuPai: {
                            ...menuPai[0],
                            menuFilho: [] 
                        }
                    });
                }

              
                if (item.IDMENUFILHO) {
                    const modulo = usuario.modulos.get(idModulo);
                    const menuFilho = await getMenuFilho(modulo.menuPai.IDMENU, item.IDMENUFILHO);
                    if (menuFilho.length > 0) {
                        modulo.menuPai.menuFilho.push(...menuFilho);
                    }
                }
            }
        }

  

        const data = Array.from(usuariosAgrupados.values()).map(usuario => ({
            ...usuario,
            modulos: Array.from(usuario.modulos.values())
        }));

        return {
            rows: data.length,
            data
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de perfil de usuário:', error);
        throw error;
    }
};


export const getMenuFilhos = async (idMenuPai, idMenuFilho) => {
    let query = `
       SELECT 
            ID, 
            DSNOME, 
            IDMENUPAI, 
            URL, 
            ALTERAR, 
            CRIAR, 
            VISUALIZAR, 
            N1,
            N2,
            N3,
            N4,
            ADMINISTRADOR
        FROM ${databaseSchema}.MENUFILHO
        WHERE 1 = ?
     
    `;

    
    const params = [1];
    
    if (idMenuPai) {
        query += ` AND IDMENUPAI = ?`;
        params.push(idMenuPai);
    }

    if(idMenuFilho) {
        query += ` AND ID IN (?)`;
        params.push(idMenuFilho);
    }

    const statement = await conn.prepare(query);
    const result = await statement.exec(params);
    
    if (!Array.isArray(result) || result.length === 0) return [];

    const data = result.map((item, index) => ({
        ID: item.ID,
        DSNOME: item.DSNOME,
        IDMENUPAI: item.IDMENUPAI,
        URL: item.URL,
        ALTERAR: item.ALTERAR,
        CRIAR: item.CRIAR,
        VISUALIZAR: item.VISUALIZAR,
        N1: item.N1,
        N2: item.N2,
        N3: item.N3,
        N4: item.N4,
        ADMINISTRADOR: item.ADMINISTRADOR
    }))

    return data;
}

export const getPerfilMenuFilho = async (idUsuario, idMenuFilho, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 500;
        const offset = (page - 1) * pageSize;

        let query = `
              SELECT 
                IDPERFIL,
                IDUSUARIO,
                IDMENU,
                DSPERFIL, 
                CRIAR, 
                ALTERAR, 
                STATIVO, 
                IDPERFILUSUARIO, 
                IDMODULO, 
                IDMODULOADMINISTRATIVO, 
                IDMODULOCOMERCIAL, 
                IDMODULOCONTABILIDADE, 
                IDMODULOFINANCEIRO, 
                IDMODULOGERENCIA, 
                IDMODULOINFORMATICA, 
                IDMODULOMARKETING, 
                IDMODULOCOMPRAS, 
                IDMODULOCADASTRO, 
                IDMODULOEXPEDICAO, 
                IDMODULOCOMPRASADM, 
                IDMODULOETIQUETAGEM, 
                IDMODULOCONFERENCIACEGA, 
                IDMODULOVOUCHER, 
                IDMODULOMALOTE, 
                IDMODULORH, 
                IDUSERULTIMAALTERACAO, 
                IDPERMISSAO, 
                IDMODULORESUMOVENDAS, 
                ADMINISTRADOR, 
                N4, 
                N3, 
                N2, 
                N1,
                IDMENUFILHO
            FROM ${databaseSchema}.PERFILUSUARIOMENU 
            WHERE 1 = ?
             
        `;

        const params = [1];

        if(idUsuario) {
            query += ` AND IDUSUARIO = ?`;
            params.push(idUsuario);
        }

        if(idMenuFilho) {
            query += ` AND IDMENUFILHO = ?`;
            params.push(idMenuFilho);
        }

        query += ` ORDER BY IDUSUARIO, IDMENUFILHO`;
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if (!Array.isArray(result) || result.length === 0) return [];

        const data = await Promise.all(result.map(async (item) => {
            const modulosAcesso = [ 
                item.IDMODULOADMINISTRATIVO,
                item.IDMODULOGERENCIA,
                item.IDMODULOINFORMATICA,
                item.IDMODULOFINANCEIRO,
                item.IDMODULOMARKETING,
                item.IDMODULORH,
                item.IDMODULOCOMERCIAL,
                item.IDMODULOCOMPRAS,
                item.IDMODULOCONTABILIDADE,
                item.IDMODULOCOMPRASADM,
                item.IDMODULOEXPEDICAO,
                item.IDMODULOCONFERENCIACEGA,
                item.IDMODULOCADASTRO,
                item.IDMODULOETIQUETAGEM,
                item.IDOMODULORESUMOVENDAS,
                item.IDMODULOVOUCHER,
                item.IDMODULOMALOTE,
                item.IDPERMISSAO
            ].filter(Boolean)

            const modulosPrincipais = await Promise.all(
                modulosAcesso.map(async (idModulo) => {
                    const modulo = await getModuloPrincipal(idModulo)

                    if(!modulo[0]) return null;

                    const menuPai = await getMenuPai(modulo[0].IDMENU)
   
                    if(!menuPai[0]) return {...modulo[0], menuPai: null};
                    const menuFilho = menuPai[0] ? await getMenuFilhos(menuPai[0].IDMENU, idMenuFilho) : [];

                    return {
                        ...modulo[0],
                        menuPai: {
                            ...menuPai[0],
                            menuFilho: menuFilho || [],
                        }
                    }
                })
            )
            
            return {
                ...item,
                modulos: modulosPrincipais.filter(Boolean)
            };
        }));
        
        return {
            rows: result.length,
            data: data
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de perfil de menu filho 2:', error);
        throw error;
    }
};

export const getPerfil = async (idPerfil, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 500;
        const offset = (page - 1) * pageSize;

        let query = `
              SELECT 
                IDPERFIL,
                IDUSUARIO,
                IDMENU,
                DSPERFIL, 
                CRIAR, 
                ALTERAR, 
                STATIVO, 
                IDPERFILUSUARIO, 
                IDMODULO, 
                IDMODULOADMINISTRATIVO, 
                IDMODULOCOMERCIAL, 
                IDMODULOCONTABILIDADE, 
                IDMODULOFINANCEIRO, 
                IDMODULOGERENCIA, 
                IDMODULOINFORMATICA, 
                IDMODULOMARKETING, 
                IDMODULOCOMPRAS, 
                IDMODULOCADASTRO, 
                IDMODULOEXPEDICAO, 
                IDMODULOCOMPRASADM, 
                IDMODULOETIQUETAGEM, 
                IDMODULOCONFERENCIACEGA, 
                IDMODULOVOUCHER, 
                IDMODULOMALOTE, 
                IDMODULORH, 
                IDUSERULTIMAALTERACAO, 
                IDPERMISSAO, 
                IDMODULORESUMOVENDAS, 
                ADMINISTRADOR, 
                N4, 
                N3, 
                N2, 
                N1,
                IDMENUFILHO
            FROM ${databaseSchema}.PERFILUSUARIOMENU 
            WHERE 1 = ?
             
        `;

        const params = [1];

        if(idPerfil) {
            query += ` AND IDPERFIL = ?`;
            params.push(idPerfil);
        }

        query += ` ORDER BY IDUSUARIO, IDMENUFILHO`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if (!Array.isArray(result) || result.length === 0) return [];

        return {
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de perfil:', error);
        throw error;
    }
};




export const updateMenuFilho = async (dados) => {
    try {
        for (const item of dados) {
            const {
                IDUSUARIO,
                CRIAR,
                ALTERAR,
                STATIVO,
                DATAULTIMAALTERACAO,
                DATA_CRIACAO,
                IDMODULO,
                IDMODULOADMINISTRATIVO,
                IDMODULOCOMERCIAL,
                IDMODULOCONTABILIDADE,
                IDMODULOFINANCEIRO,
                IDMODULOGERENCIA,
                IDMODULOINFORMATICA,
                IDMODULOMARKETING,
                IDMODULOCOMPRAS,
                IDMODULOCADASTRO,
                IDMODULOEXPEDICAO,
                IDMODULOCOMPRASADM,
                IDMODULOETIQUETAGEM,
                IDMODULOCONFERENCIACEGA,
                IDMODULOVOUCHER,
                IDMODULOMALOTE,
                IDMODULORH,
                IDUSERULTIMAALTERACAO,
                IDPERMISSAO,
                IDMODULORESUMOVENDAS,
                ADMINISTRADOR,
                N4,
                N3,
                N2,
                N1,
                IDMENU,
                IDMENUFILHO,
            } = item;

            const menuFilhos = Array.isArray(IDMENUFILHO) ? IDMENUFILHO : [IDMENUFILHO];

            for (const menuFilho of menuFilhos) {
                if (IDUSUARIO == null || menuFilho == null) {
                    console.warn('⚠️ Dados inválidos: IDUSUARIO ou IDMENUFILHO ausente', { IDUSUARIO, menuFilho });
                    continue;
                }

                const checkQuery = `
                    SELECT COUNT(*) AS TOTAL
                    FROM ${databaseSchema}.PERFILUSUARIOMENU
                    WHERE IDUSUARIO = ? AND IDMENUFILHO = ?
                `;

                const result = await conn.exec(checkQuery, [IDUSUARIO, menuFilho]);
                const exists = result[0]?.TOTAL > 0;

                if (exists) {
                    let updateQuery = `
                    UPDATE ${databaseSchema}.PERFILUSUARIOMENU SET
                `;
                const params = [];

                if (IDMODULO) {
                    updateQuery += `IDMODULO = ?, `;
                    params.push(IDMODULO);
                }

                if (IDMODULOADMINISTRATIVO) {
                    updateQuery += `IDMODULOADMINISTRATIVO = ?, `;
                    params.push(IDMODULOADMINISTRATIVO);
                }

                if (IDMODULOCOMERCIAL) {
                    updateQuery += `IDMODULOCOMERCIAL = ?, `;
                    params.push(IDMODULOCOMERCIAL);
                }

                if (IDMODULOCONTABILIDADE) {
                    updateQuery += `IDMODULOCONTABILIDADE = ?, `;
                    params.push(IDMODULOCONTABILIDADE);
                }

                if (IDMODULOFINANCEIRO) {
                    updateQuery += `IDMODULOFINANCEIRO = ?, `;
                    params.push(IDMODULOFINANCEIRO);
                }

                if (IDMODULOGERENCIA) {
                    updateQuery += `IDMODULOGERENCIA = ?, `;
                    params.push(IDMODULOGERENCIA);
                }

                if (IDMODULOINFORMATICA) {
                    updateQuery += `IDMODULOINFORMATICA = ?, `;
                    params.push(IDMODULOINFORMATICA);
                }

                if (IDMODULOMARKETING) {
                    updateQuery += `IDMODULOMARKETING = ?, `;
                    params.push(IDMODULOMARKETING);
                }

                if (IDMODULOCOMPRAS) {
                    updateQuery += `IDMODULOCOMPRAS = ?, `;
                    params.push(IDMODULOCOMPRAS);
                }

                if (IDMODULOCADASTRO) {
                    updateQuery += `IDMODULOCADASTRO = ?, `;
                    params.push(IDMODULOCADASTRO);
                }

                if (IDMODULOEXPEDICAO) {
                    updateQuery += `IDMODULOEXPEDICAO = ?, `;
                    params.push(IDMODULOEXPEDICAO);
                }

                if (IDMODULOCOMPRASADM) {
                    updateQuery += `IDMODULOCOMPRASADM = ?, `;
                    params.push(IDMODULOCOMPRASADM);
                }

                if (IDMODULOETIQUETAGEM) {
                    updateQuery += `IDMODULOETIQUETAGEM = ?, `;
                    params.push(IDMODULOETIQUETAGEM);
                }

                if (IDMODULOCONFERENCIACEGA) {
                    updateQuery += `IDMODULOCONFERENCIACEGA = ?, `;
                    params.push(IDMODULOCONFERENCIACEGA);
                }

                if (IDMODULOVOUCHER) {
                    updateQuery += `IDMODULOVOUCHER = ?, `;
                    params.push(IDMODULOVOUCHER);
                }

                if (IDMODULOMALOTE) {
                    updateQuery += `IDMODULOMALOTE = ?, `;
                    params.push(IDMODULOMALOTE);
                }

                if (IDMODULORH) {
                    updateQuery += `IDMODULORH = ?, `;
                    params.push(IDMODULORH);
                }

                if (IDPERMISSAO) {
                    updateQuery += `IDPERMISSAO = ?, `;
                    params.push(IDPERMISSAO);
                }

                if (IDMODULORESUMOVENDAS) {
                    updateQuery += `IDMODULORESUMOVENDAS = ?, `;
                    params.push(IDMODULORESUMOVENDAS);
                }

                if (IDMENU) {
                    updateQuery += `IDMENU = ?, `;
                    params.push(IDMENU);
                }

                if (CRIAR !== undefined) {
                    updateQuery += `CRIAR = ?, `;
                    params.push(CRIAR);
                }

                if (ALTERAR !== undefined) {
                    updateQuery += `ALTERAR = ?, `;
                    params.push(ALTERAR);
                }

                if (ADMINISTRADOR !== undefined) {
                    updateQuery += `ADMINISTRADOR = ?, `;
                    params.push(ADMINISTRADOR);
                }

                if (N1 !== undefined) {
                    updateQuery += `N1 = ?, `;
                    params.push(N1);
                }

                if (N2 !== undefined) {
                    updateQuery += `N2 = ?, `;
                    params.push(N2);
                }

                if (N3 !== undefined) {
                    updateQuery += `N3 = ?, `;
                    params.push(N3);
                }

                if (N4 !== undefined) {
                    updateQuery += `N4 = ?, `;
                    params.push(N4)
                }

                if (IDUSERULTIMAALTERACAO) {
                    updateQuery += `IDUSERULTIMAALTERACAO = ?, `;
                    params.push(IDUSERULTIMAALTERACAO);
                }

                // Adiciona a cláusula WHERE
                updateQuery = updateQuery.replace(/, $/, '');
                updateQuery += `, DATAULTIMAALTERACAO = CURRENT_TIMESTAMP WHERE IDUSUARIO = ? AND IDMENUFILHO = ?`;
                params.push(IDUSUARIO, menuFilho);
               
                const statement = await conn.prepare(updateQuery);
                await statement.exec(params);
              
                } else {
                    const insertQuery = `
                        INSERT INTO ${databaseSchema}.PERFILUSUARIOMENU (
                            IDUSUARIO, 
                            IDMODULO, 
                            IDMODULOADMINISTRATIVO,
                            IDMODULOCOMERCIAL,
                            IDMODULOCONTABILIDADE,
                            IDMODULOFINANCEIRO,
                            IDMODULOGERENCIA,
                            IDMODULOINFORMATICA,
                            IDMODULOMARKETING,
                            IDMODULOCOMPRAS,
                            IDMODULOCADASTRO,
                            IDMODULOEXPEDICAO,
                            IDMODULOCOMPRASADM,
                            IDMODULOETIQUETAGEM,
                            IDMODULOCONFERENCIACEGA,
                            IDMODULOVOUCHER,
                            IDMODULOMALOTE,
                            IDMODULORH,
                            IDUSERULTIMAALTERACAO,
                            IDPERMISSAO,
                            IDMODULORESUMOVENDAS,
                            IDMENU, 
                            IDMENUFILHO,
                            CRIAR, 
                            ALTERAR, 
                            ADMINISTRADOR,
                            N1, 
                            N2, 
                            N3, 
                            N4
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await conn.exec(insertQuery, [
                        IDUSUARIO,
                        IDMODULO,
                        IDMODULOADMINISTRATIVO,
                        IDMODULOCOMERCIAL,
                        IDMODULOCONTABILIDADE,
                        IDMODULOFINANCEIRO,
                        IDMODULOGERENCIA,
                        IDMODULOINFORMATICA,
                        IDMODULOMARKETING,
                        IDMODULOCOMPRAS,
                        IDMODULOCADASTRO,
                        IDMODULOEXPEDICAO,
                        IDMODULOCOMPRASADM,
                        IDMODULOETIQUETAGEM,
                        IDMODULOCONFERENCIACEGA,
                        IDMODULOVOUCHER,
                        IDMODULOMALOTE,
                        IDMODULORH,
                        IDUSERULTIMAALTERACAO,
                        IDPERMISSAO,
                        IDMODULORESUMOVENDAS,
                        IDMENU,
                        menuFilho,
                        CRIAR,
                        ALTERAR,
                        ADMINISTRADOR,
                        N1,
                        N2,
                        N3,
                        N4
                    ]);
                    console.log(`🆕 Permissão inserida para IDUSUARIO ${IDUSUARIO}, IDMENUFILHO ${menuFilho}`);
                }
            }
        }


        await conn.commit();
        console.log('🚀 Atualização de menus filhos concluída com sucesso.');
    } catch (error) {
        console.error('❌ Erro ao executar a atualização de menus filhos:', error);
        throw error;
    }
};




export const updatePerfilMenuFilho = async (dados) => {
    try {
        for (const item of dados) {
            const {
                IDUSUARIO,
                CRIAR,
                ALTERAR,
                ADMINISTRADOR,
                N4,
                N3,
                N2,
                N1,
                IDMENUPAI,
                ID,
            } = item;

            const menuFilhos = Array.isArray(ID) ? ID : [ID];

            for (const menuFilho of menuFilhos) {
                if (IDUSUARIO == null || menuFilho == null) {
                    console.warn('⚠️ Dados inválidos: IDUSUARIO ou IDMENUFILHO ausente', { IDUSUARIO, menuFilho });
                    continue;
                }

                const checkQuery = `
                    SELECT COUNT(*) AS TOTAL
                    FROM ${databaseSchema}.PERFILUSUARIOMENU
                    WHERE IDUSUARIO = ? AND IDMENUFILHO = ?
                `;

                const result = await conn.exec(checkQuery, [IDUSUARIO, menuFilho]);
                const exists = result[0]?.TOTAL > 0;

                if (exists) {
                    let updateQuery = `
                    UPDATE ${databaseSchema}.MENUFILHO SET
                `;
                const params = [];


                if (CRIAR !== undefined) {
                    updateQuery += `CRIAR = ?, `;
                    params.push(CRIAR);
                }

                if (ALTERAR !== undefined) {
                    updateQuery += `ALTERAR = ?, `;
                    params.push(ALTERAR);
                }

                if (ADMINISTRADOR !== undefined) {
                    updateQuery += `ADMINISTRADOR = ?, `;
                    params.push(ADMINISTRADOR);
                }

                if (N1 !== undefined) {
                    updateQuery += `N1 = ?, `;
                    params.push(N1);
                }

                if (N2 !== undefined) {
                    updateQuery += `N2 = ?, `;
                    params.push(N2);
                }

                if (N3 !== undefined) {
                    updateQuery += `N3 = ?, `;
                    params.push(N3);
                }

                if (N4 !== undefined) {
                    updateQuery += `N4 = ?, `;
                    params.push(N4)
                }

                // Adiciona a cláusula WHERE
                updateQuery = updateQuery.replace(/, $/, '');
                updateQuery += `, IDMENUFILHO = ?`;
                params.push(IDUSUARIO, menuFilho);
               
                const statement = await conn.prepare(updateQuery);
                await statement.exec(params);
              
                } else {
                    const insertQuery = `
                        INSERT INTO ${databaseSchema}.MENUFILHO (
                            ID, 
                            CRIAR, 
                            ALTERAR, 
                            ADMINISTRADOR,
                            N1, 
                            N2, 
                            N3, 
                            N4
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await conn.exec(insertQuery, [
                        menuFilho,
                        CRIAR,
                        ALTERAR,
                        ADMINISTRADOR,
                        N1,
                        N2,
                        N3,
                        N4
                    ]);
                    console.log(`🆕 Permissão inserida para IDUSUARIO ${IDUSUARIO}, IDMENUFILHO ${menuFilho}`);
                }
            }
        }


        await conn.commit();
        console.log('🚀 Atualização de menus filhos concluída com sucesso.');
    } catch (error) {
        console.error('❌ Erro ao executar a atualização de menus filhos:', error);
        throw error;
    }
};

export const updatePerfilUsuarioMenu = async (dados, idModulo, idUsuario, idMenuPai) => {

    try {

        for (const item of dados) {
            const perfil = item.perfilUsuario;
            const {
                IDMODULOADMINISTRATIVO,
                IDMODULOCOMERCIAL,
                IDMODULOCONTABILIDADE,
                IDMODULOFINANCEIRO,
                IDMODULOGERENCIA,
                IDMODULOINFORMATICA,
                IDMODULOMARKETING,
                IDMODULOCOMPRAS,
                IDMODULOCADASTRO,
                IDMODULOEXPEDICAO,
                IDMODULOCOMPRASADM,
                IDMODULOETIQUETAGEM,
                IDMODULOCONFERENCIACEGA,
                IDMODULOVOUCHER,
                IDMODULOMALOTE,
                IDMODULORH,
                IDPERMISSAO,
                IDMODULORESUMOVENDAS,
                IDUSERULTIMAALTERACAO
            } = perfil;

            let queryPerfilUsuarioMenu = `
                UPDATE ${databaseSchema}.PERFILUSUARIOMENU SET
            `;

            const params = [];

            if (IDMODULOADMINISTRATIVO) {
                queryPerfilUsuarioMenu += `IDMODULOADMINISTRATIVO = ?, `;
                params.push(IDMODULOADMINISTRATIVO);
            }

            if (IDMODULOCOMERCIAL) {
                queryPerfilUsuarioMenu += `IDMODULOCOMERCIAL = ?, `;
                params.push(IDMODULOCOMERCIAL);
            }

            if (IDMODULOCONTABILIDADE) {
                queryPerfilUsuarioMenu += `IDMODULOCONTABILIDADE = ?, `;
                params.push(IDMODULOCONTABILIDADE);
            }

            if (IDMODULOFINANCEIRO) {
                queryPerfilUsuarioMenu += `IDMODULOFINANCEIRO = ?, `;
                params.push(IDMODULOFINANCEIRO);
            }

            if (IDMODULOGERENCIA) {
                queryPerfilUsuarioMenu += `IDMODULOGERENCIA = ?, `;
                params.push(IDMODULOGERENCIA);
            }

            if (IDMODULOINFORMATICA) {
                queryPerfilUsuarioMenu += `IDMODULOINFORMATICA = ?, `;
                params.push(IDMODULOINFORMATICA);
            }

            if (IDMODULOMARKETING) {
                queryPerfilUsuarioMenu += `IDMODULOMARKETING = ?, `;
                params.push(IDMODULOMARKETING);
            }

            if (IDMODULOCOMPRAS) {
                queryPerfilUsuarioMenu += `IDMODULOCOMPRAS = ?, `;
                params.push(IDMODULOCOMPRAS);
            }

            if (IDMODULOCADASTRO) {
                queryPerfilUsuarioMenu += `IDMODULOCADASTRO = ?, `;
                params.push(IDMODULOCADASTRO);
            }

            if (IDMODULOEXPEDICAO) {
                queryPerfilUsuarioMenu += `IDMODULOEXPEDICAO = ?, `;
                params.push(IDMODULOEXPEDICAO);
            }

            if (IDMODULOCOMPRASADM) {
                queryPerfilUsuarioMenu += `IDMODULOCOMPRASADM = ?, `;
                params.push(IDMODULOCOMPRASADM);
            }

            if (IDMODULOETIQUETAGEM) {
                queryPerfilUsuarioMenu += `IDMODULOETIQUETAGEM = ?, `;
                params.push(IDMODULOETIQUETAGEM);
            }

            if (IDMODULOCONFERENCIACEGA) {
                queryPerfilUsuarioMenu += `IDMODULOCONFERENCIACEGA = ?, `;
                params.push(IDMODULOCONFERENCIACEGA);
            }

            if (IDMODULOVOUCHER) {
                queryPerfilUsuarioMenu += `IDMODULOVOUCHER = ?, `;
                params.push(IDMODULOVOUCHER);
            }

            if (IDMODULOMALOTE) {
                queryPerfilUsuarioMenu += `IDMODULOMALOTE = ?, `;
                params.push(IDMODULOMALOTE);
            }

            if (IDMODULORH) {
                queryPerfilUsuarioMenu += `IDMODULORH = ?, `;
                params.push(IDMODULORH);
            }

            if (IDPERMISSAO) {
                queryPerfilUsuarioMenu += `IDPERMISSAO = ?, `;
                params.push(IDPERMISSAO);
            }

            if (IDMODULORESUMOVENDAS) {
                queryPerfilUsuarioMenu += `IDMODULORESUMOVENDAS = ?, `;
                params.push(IDMODULORESUMOVENDAS);
            }

            queryPerfilUsuarioMenu += `
                IDUSERULTIMAALTERACAO = ?,
                DATAULTIMAALTERACAO = CURRENT_TIMESTAMP, 
                WHERE IDUSUARIO = ?
            `;

            params.push(IDUSERULTIMAALTERACAO);
            params.push(idUsuario); // IDFUNCIONARIO
            // console.log(params, 'params');
            queryPerfilUsuarioMenu = queryPerfilUsuarioMenu.replace(/,\s*WHERE/, ' WHERE');
            const statementPerfilUsuarioMenu = await conn.prepare(queryPerfilUsuarioMenu);
            await statementPerfilUsuarioMenu.exec(params);

        }


        const atualizarMenuFilho = await updateMenuFilho(dados.map(item => ({
            ...item.putMenuFilhoUsuario,
            IDUSERULTIMAALTERACAO: item.perfilUsuario.IDUSERULTIMAALTERACAO,
        })));

        if (!atualizarMenuFilho) {
            throw new Error('Erro ao atualizar o menu filho.');
        }

        await conn.commit();
        console.log('Dados salvos com sucesso nas tabelas PERFILUSUARIOMENU e MENUFILHO.');
    } catch (error) {
        console.error('Erro ao salvar os dados:', error);
        throw error;
    }
};

export const getModulos = async () => {
    try {


        const query = `
          SELECT ID, DSMODULO, IDPERFIL, IDMENU, NOME
            FROM ${databaseSchema}.MODULOPRINCIPAL WHERE  1 = ?
            ORDER BY ID

    `;
        const params = [1];

        // query += ' ORDER BY ID';

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            rows: result.length,
            data: result
        };

    } catch (error) {
        console.error('Erro ao executar a consulta de módulos:', error);
        throw error;
    }
};

export const updateModulo = async (dados) => {
    try {

        const query = `
            UPDATE "${databaseSchema}"."MODULO" SET 
            "IDMODULO" = ?, 
            "DSMODULO" = ?
            WHERE "IDMODULO" = ?
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {

            const params = [
                registro.IDMODULO,
                registro.DSMODULO,
            ]
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Modulo atualizado com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização do Modulo:', error);
        throw error;
    }
}

export const createModulo = async (dados) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}"."MODULO" 
            (
                "IDMODULO", 
                "DSMODULO"
            )
            VALUES (?, ?)
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {
            // Gera o próximo IDMODULO, caso necessário
            const idQuery = `SELECT IFNULL(MAX(TO_INT("IDMODULO")), 0) + 1 AS novoId FROM "${databaseSchema}"."MODULO"`;
            const idResult = await conn.exec(idQuery);
            const novoId = idResult[0].NOVOID || registro.IDMODULO;

            const params = [
                novoId,  // IDMODULO gerado ou o fornecido em `registro.IDMODULO`
                registro.DSMODULO
            ];

            await statement.exec(params);
        }

        await conn.commit();
        return {
            status: 'success',
            message: 'Módulo(s) atualizado(s) com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar a atualização do Módulo:', error);
        throw error;
    } finally {
        conn.close();
    }
}

/* Calça */
// SELECT NUCODBARRAS,  IDPRODUTO , DSNOME, PRECOVENDA  FROM QUALITY_CONC_HML.PRODUTO WHERE NUCODBARRAS IN(
// '8070599008307',
// '8070599008314',
// '8070599008291',
// '8070599008284',
// '8072117001814',
// '8072117001821',
// '8072117001807',
// '8072117001791',
// '8072117001371',
// '8072117001388',
// '8072117001364',
// '8072117001357',
// '8112117000308',
// '8112117000315',
// '8112117000339',
// '8112117000322',
// '8112117000346',
// '8112117000278',
// '8112117000261',
// '8112117000285',
// '8112117000391',
// '8112117000384',
// '8112117000407',
// '8112117000360',
// '8112117000353',
// '8112117000377'
// )

// /* Blusão Moletom */
// SELECT NUCODBARRAS,  IDPRODUTO  FROM QUALITY_CONC_HML.PRODUTO WHERE NUCODBARRAS IN(
// '1072051115162',
// '1072051115179',
// '1072051115155',
// '1072051115148',
// '8072117001951',
// '8072117008981',
// '8072117008998',
// '8072117008974',
// '8072117008967',
// '8072117009063',
// '8072117009070',
// '8072117009056',
// '8072117009049',
// '8072117009100',
// '8072117009117',
// '8072117009094',
// '8072117009087',
// '8072117009148',
// '8072117009155',
// '8072117009131',
// '8072117009124',
// '8072117003788',
// '8072117003795',
// '8072117003771',
// '8072117002187',
// '8072117002194',
// '8072117002170',
// '8072117002163',
// '8072117002422',
// '8072117002439',
// '8072117002415',
// '8072117002408',
// '8072117002705',
// '8072117002712',
// '8072117002699',
// '8072117002682',
// '8072117003818',
// '8072117003832',
// '8072117003801',
// '8072117002880'
// );

// /*  */
// SELECT NUCODBARRAS, IDPRODUTO  FROM QUALITY_CONC_HML.PRODUTO WHERE NUCODBARRAS IN(
// '8070400000209'
// );


// SELECT * FROM QUALITY_CONC_HML.RESUMOPROMOCAOMARKETING;
// SELECT * FROM QUALITY_CONC_HML.DETALHEPROMOCAO;
// SELECT * FROM QUALITY_CONC_HML.EMPRESAPROMOCAOMARKETING WHERE IDRESUMOPROMOCAOMARKETING = 1;
// SELECT * FROM QUALITY_CONC_HML.DETALHEPROMOCAOMARKETINGORIGEM WHERE IDRESUMOPROMOCAOMARKETING = 1;
// SELECT * FROM QUALITY_CONC_HML.DETALHEPROMOCAOMARKETINGDESTINO WHERE IDRESUMOPROMOCAOMARKETING = 1;




// CREATE COLUMN TABLE "QUALITY_CONC_HML"."PERFILUSUARIOMENU" (
//     IDPERFIL INTEGER NOT NULL, 
//     IDUSUARIO INTEGER NOT NULL,
//     VISUALIZAR VARCHAR(10) DEFAULT 'TRUE', 
//     CRIAR VARCHAR(10) DEFAULT 'FALSE', 
//     ALTERAR VARCHAR(10) DEFAULT 'FALSE', 
//     ADMINISTRADOR VARCHAR(10) DEFAULT 'FALSE', 
//     N1 VARCHAR(10) DEFAULT 'FALSE', 
//     N2 VARCHAR(10) DEFAULT 'FALSE', 
//     N3 VARCHAR(10) DEFAULT 'FALSE', 
//     N4 VARCHAR(10) DEFAULT 'TRUE', 
//     IDMENU INTEGER NOT NULL, 
//     IDMENUFILHO INTEGER NOT NULL, 
//     DATAULTIMAALTERACAO TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
//     DATA_CRIACAO TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
//     IDPERFILUSUARIO INTEGER NOT NULL, 
//     IDMODULO VARCHAR(50), 
//     IDMODULOADMINISTRATIVO VARCHAR(50), 
//     IDMODULOCOMERCIAL VARCHAR(50), 
//     IDMODULOCONTABILIDADE VARCHAR(50), 
//     IDMODULOFINANCEIRO VARCHAR(50), 
//     IDMODULOGERENCIA VARCHAR(50), 
//     IDMODULOINFORMATICA VARCHAR(50), 
//     IDMODULOMARKETING VARCHAR(50), 
//     IDMODULOCOMPRAS VARCHAR(50),    
//     IDMODULOCADASTRO VARCHAR(50), 
//     IDMODULOEXPEDICAO VARCHAR(50), 
//     IDMODULOCOMPRASADM VARCHAR(50), 
//     IDMODULOETIQUETAGEM VARCHAR(50), 
//     IDMODULOCONFERENCIACEGA VARCHAR(50), 
//     IDMODULOVOUCHER VARCHAR(50), 
//     IDMODULOMALOTE VARCHAR(50), 
//     IDMODULORH VARCHAR(50), 
//     IDPERMISSAO VARCHAR(50), 
//     IDMODULORESUMOVENDAS VARCHAR(50), 
//     IDMODULOPROMOCAO VARCHAR(50),
//     IDUSERULTIMAALTERACAO VARCHAR(50), 
//     STATIVO VARCHAR(10) DEFAULT 'TRUE',
// );


// CREATE COLUMN TABLE "QUALITY_CONC_HML"."MENUFILHO" (
//     ID INTEGER NOT NULL, 
//     DSNOME VARCHAR(250)
//     IDMENUPAI INTEGER NOT NULL, 
//     URL VARCHAR(250),
//     N1 VARCHAR(10) DEFAULT 'FALSE', 
//     N2 VARCHAR(10) DEFAULT 'FALSE',
//     N3 VARCHAR(10) DEFAULT 'FALSE',
//     N4 VARCHAR(10) DEFAULT 'TRUE',
//     ADMINISTRADOR VARCHAR(10) DEFAULT 'FALSE', 
//     VISUALIZAR VARCHAR(10) DEFAULT 'TRUE',
//     ALTERAR VARCHAR(10) DEFAULT 'FALSE',
//     CRIAR VARCHAR(10) DEFAULT 'FALSE'
// );

// CREATE COLUMN TABLE "QUALITY_CONC_HML"."MENUPAI" (
//     IDMENU INTEGER NOT NULL,
//     IDMODULO INTEGER NOT NULL, 
//     STATIVO VARCHAR(10) NOT NULL, 
//     DSMENU VARCHAR(250) NOT NULL
// );


// CREATE COLUMN TABLE "QUALITY_CONC_HML"."MODULOPRINCIPAL" (
//     ID INTEGER NOT NULL,
//     DSMODULO VARCHAR(250) NOT NULL, 
//     IDPERFIL INTEGER NOT NULL, 
//     IDMENU INTEGER NOT NULL, 
//     NOME VARCHAR NOT NULL
// );


