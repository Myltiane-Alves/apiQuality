from pynfe.processamento.comunicacao import ComunicacaoSefaz
from bs4 import BeautifulSoup
import datetime
import pandas as pd
import os
import shutil
import csv
import tkinter as tk
from tkinter import messagebox, ttk
import chardet
import urllib3

# Desativa o aviso HTTPS inseguro
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ===================== CONFIG ===================== #
CERTIFICADO = r"C:\certificados\GTO COMERCIO 2025-2026.pfx"
SENHA = '#senhagto2024#'

ARQ_PLANILHA = r"C:\desenvolvimento_gto_testes\python_notas\consulta_nfe\dados.xlsx"
PASTA_RESULTADOS = r"C:\desenvolvimento_gto_testes\python_notas\resultados"
LOG_DIR = r"C:\desenvolvimento_gto_testes\python_notas\consulta_nfe\log"
LOG_FILE = os.path.join(LOG_DIR, 'consultas.csv')
# ================================================== #

# 1) Janela de confirmação (continuar / recomeçar do zero)
root_confirm = tk.Tk()
root_confirm.withdraw()
resposta = messagebox.askyesno("Confirmação", "Deseja continuar o script anterior?")
continuar = resposta  # True = Sim; False = Não
root_confirm.destroy()

# 2) Pastas de saída e LOG
if not continuar and os.path.isdir(PASTA_RESULTADOS):
    shutil.rmtree(PASTA_RESULTADOS)
os.makedirs(PASTA_RESULTADOS, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# Se recomeçar do zero: zera o LOG
if not continuar and os.path.isfile(LOG_FILE):
    os.remove(LOG_FILE)
if not continuar:
    with open(LOG_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['DATA_HORA','IDVENDA','UF','CHAVE','CSTAT','SUBPASTA','ARQUIVO'])
        writer.writeheader()

# 3) Carrega LOG existente (se houver) para pular chaves já consultadas
chaves_consultadas = set()
if os.path.isfile(LOG_FILE):
    try:
        # Detecta automaticamente a codificação do arquivo
        with open(LOG_FILE, 'rb') as f:
            enc = chardet.detect(f.read(5000))['encoding'] or 'utf-8'

        with open(LOG_FILE, 'r', newline='', encoding=enc, errors='replace') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('CHAVE'):
                    chaves_consultadas.add(row['CHAVE'].strip())
    except Exception as e:
        print(f'Aviso: falha ao ler LOG existente: {e}')

def registrar_log(linha_log: dict):
    campos = ['DATA_HORA','IDVENDA','UF','CHAVE','CSTAT','SUBPASTA','ARQUIVO']
    escrever_cabecalho = not os.path.isfile(LOG_FILE)
    try:
        with open(LOG_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=campos)
            if escrever_cabecalho:
                writer.writeheader()
            writer.writerow({
                'DATA_HORA': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'IDVENDA': linha_log.get('IDVENDA',''),
                'UF': linha_log.get('UF',''),
                'CHAVE': linha_log.get('CHAVE',''),
                'CSTAT': linha_log.get('CSTAT',''),
                'SUBPASTA': linha_log.get('SUBPASTA',''),
                'ARQUIVO': linha_log.get('ARQUIVO','')
            })
    except Exception as e:
        print(f'Aviso: falha ao escrever no LOG: {e}')

# 4) Carrega planilha
df = pd.read_excel(ARQ_PLANILHA)

# 5) Monta a fila de tarefas considerando o LOG (para calcular TOTAL real)
tarefas = []
for _, row in df.iterrows():
    idv = str(row['IDVENDA'])
    ufv = str(row['NFE_INFNFE_EMIT_ENDEREMIT_UF'])
    chv = str(row['CHAVE']).strip()
    if chv in chaves_consultadas:
        # já consultada — será pulada
        continue
    tarefas.append({'IDVENDA': idv, 'UF': ufv, 'CHAVE': chv})

total = len(tarefas)
processados = 0

# 6) Janela de progresso (fica aberta durante toda a execução)
root_prog = tk.Tk()
root_prog.title("Progresso – Consulta NFE")
root_prog.geometry("520x140")

status_var = tk.StringVar()
status_var.set(f"Processados {processados} de {total} — Faltam {total - processados}")

lbl = tk.Label(root_prog, textvariable=status_var, font=("Segoe UI", 11))
lbl.pack(pady=10)

bar = ttk.Progressbar(root_prog, orient="horizontal", length=480, mode="determinate", maximum=max(total, 1))
bar['value'] = processados
bar.pack(pady=5)

obs_lbl = tk.Label(root_prog, text="A janela permanecerá aberta durante a execução.", font=("Segoe UI", 9))
obs_lbl.pack(pady=5)

# Garante renderização inicial
root_prog.update_idletasks()
root_prog.update()

# 7) Processamento
chaves_pendentes = set(t['CHAVE'] for t in tarefas)

for req, linha in df.groupby("IDVENDA"):
    for index, row in linha.iterrows():
        IDVENDA_ = str(row['IDVENDA'])
        UF_ = str(row['NFE_INFNFE_EMIT_ENDEREMIT_UF'])
        CHAVE_ = str(row['CHAVE']).strip()

        # Pula se já consultada (LOG) ou se não está nas pendentes
        if CHAVE_ in chaves_consultadas or CHAVE_ not in chaves_pendentes:
            continue

        uf = UF_
        homologacao = False
        chave_acesso = CHAVE_

        con = ComunicacaoSefaz(uf, CERTIFICADO, SENHA, homologacao)
        envio = con.consulta_nota('nfce', chave_acesso)  # nfe ou nfce

        doc = (envio.text.encode('utf-8'))  # Para SP pode usar envio.content
        soup = BeautifulSoup(doc, "xml")

        cstat_tag = soup.find('cstat') or soup.find('cStat')
        CSTAT = cstat_tag.text if cstat_tag else 'SEM_CSTAT'

        SubPasta = os.path.join(PASTA_RESULTADOS, f"{CSTAT}-{uf}")
        os.makedirs(SubPasta, exist_ok=True)

        print(IDVENDA_, chave_acesso, CSTAT)

        arquivo_saida = os.path.join(SubPasta, f"{IDVENDA_}.txt")
        with open(arquivo_saida, 'w', encoding='utf-8') as arquivo:
            arquivo.write(soup.prettify())

        # LOG + memória
        registrar_log({
            'IDVENDA': IDVENDA_,
            'UF': uf,
            'CHAVE': CHAVE_,
            'CSTAT': CSTAT,
            'SUBPASTA': SubPasta,
            'ARQUIVO': arquivo_saida
        })
        chaves_consultadas.add(CHAVE_)
        chaves_pendentes.discard(CHAVE_)

        # Atualiza progresso
        processados += 1
        status_var.set(f"Processados {processados} de {total} — Faltam {total - processados}")
        bar['value'] = processados
        root_prog.update_idletasks()
        root_prog.update()

# Finaliza progresso
status_var.set("Concluído ✔")
root_prog.mainloop()
#pip install -r requirements.txt


# pegar os dados conforme a planilha consulta_nfe/dados.xlsx, verificar o status na SEFAZ e retornar o status