# your_app_name/management/commands/import_csv.py
import csv
# import os
from django.core.management.base import BaseCommand
from django.db.models import Q
from mainapp.models import Protein, InterfaceSimilarity
import pandas as pd
import numpy as np

class Command(BaseCommand):
    help = 'Import data from tab-delimited file into the InterfaceSimilarity model'

    
    def handle(self, *args, **kwargs):
        InterfaceSimilarity.objects.all().delete() #this will delete all other tables, as there are foreign keys
        file_path = "static/downloads/interface/v2h_binary_list_with_ires_iseq_category_seq_20231012.txt"
        tab = pd.read_csv(file_path,sep='\t').dropna()
        # print(tab.iloc[0,:])
        cnt = 1
        for _, row in tab.iterrows():
            # break
            # stab = tab[tab['Viral_protein_uid']==entry['Viral_protein_uid']]
            # ires_lst_v = []
            # if entry['Viral_ires'] != '-':
            #     ires_lst_v = [int(ele) for ele in entry['Viral_ires'].split(',')]
            # for _, row in stab.iterrows():
                try:
                    if type(row['Viral_seq']) is str:
                        ires_mask = np.zeros(int(row['Viral_res_range'].split(',')[-1]),dtype=int)
                    else:
                        ires_mask = ""
                except:
                    print(row)
                # print(row['Viral_ires'])
                ires_lst = []
                if row['Viral_ires'] != '-':
                    ires_lst = [int(ele)-1 for ele in row['Viral_ires'].split(',')]
                if len(ires_lst) == 0:
                    ires = 'NaN'
                    ires_mask = ";".join(str(e) for e in ires_mask)
                else:
                    # print(ires_lst)
                    ires_mask[ires_lst] = 1
                    ires_mask = ";".join(str(e) for e in ires_mask)
                    ires = row['Viral_ires']

                # if len(set(ires_lst_v+ires_lst)) == 0:
                # jsim = -1
                # else:
                #     jsim = (len(ires_lst_v)+len(ires_lst)-len(set(ires_lst_v+ires_lst))) / len(set(ires_lst_v+ires_lst))

                InterfaceSimilarity.objects.create(
                    id=cnt,
                    p2_gene = row['Human_protein_name'],
                    p2_protein_true = row['Human_recommended_protein_name'],
                    p2_gene_true = row['Human_primary_gene_name'],
                    p1=Protein.objects.get(id=row['Viral_protein_uid']),
                    p2=Protein.objects.get(id=row['Human_protein_uid']),
                    ires = ires,
                    ires_mask = ires_mask,
                    interactor = row['Human_protein_uid'],
                    interactor_gene = row['Human_protein_name'],
                    interactor_protein_true = row['Human_recommended_protein_name'],
                    interactor_gene_true = row['Human_primary_gene_name'],
                    is_viral='True',
                    similarity = row['score']
                )
                cnt = cnt + 1

            # stab = tab[tab['Human_protein_uid']==entry['Human_protein_uid']]
            # ires_lst_v = []
            # if entry['Human_ires'] != '-':
            #     ires_lst_v = [int(ele) for ele in entry['Human_ires'].split(',')]
            # for _, row in stab.iterrows():
                if type(row['Human_seq']) is str:
                    ires_mask = np.zeros(int(row['Human_res_range'].split(',')[-1]),dtype=int)
                else:
                    ires_mask = ""
                ires_lst = []
                if row['Human_ires'] != '-':
                    ires_lst = [int(ele)-1 for ele in row['Human_ires'].split(',')]
                if len(ires_lst) == 0:
                    ires = 'NaN'
                    ires_mask = ";".join(str(e) for e in ires_mask)
                else:
                    ires_mask[ires_lst] = 1
                    ires_mask = ";".join(str(e) for e in ires_mask)
                    ires = row['Human_ires']

                # if len(set(ires_lst_v+ires_lst)) == 0:
                # jsim = -1
                # else:
                #     jsim = (len(ires_lst_v)+len(ires_lst)-len(set(ires_lst_v+ires_lst))) / len(set(ires_lst_v+ires_lst))
                InterfaceSimilarity.objects.create(
                    id=cnt,
                    p2_gene = row['Human_protein_name'],
                    p2_protein_true = row['Human_recommended_protein_name'],
                    p2_gene_true = row['Human_primary_gene_name'],
                    p1=Protein.objects.get(id=row['Viral_protein_uid']),
                    p2=Protein.objects.get(id=row['Human_protein_uid']),
                    ires = ires,
                    ires_mask = ires_mask,
                    interactor = row['Viral_protein_uid'],
                    interactor_gene = row['Viral_protein_name'],
                    interactor_protein_true = row['Viral_recommended_protein_name'],
                    interactor_gene_true = row['Viral_primary_gene_name'],
                    is_viral='False',
                    similarity = row['score']
                )
                cnt = cnt + 1

        self.stdout.write(self.style.SUCCESS('CSV data imported successfully.'))
