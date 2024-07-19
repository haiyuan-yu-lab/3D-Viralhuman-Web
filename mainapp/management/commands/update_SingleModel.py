# your_app_name/management/commands/import_csv.py
import csv
# import os
from django.core.management.base import BaseCommand
from django.db.models import Q
from mainapp.models import SingleModel, Protein
import pandas as pd

class Command(BaseCommand):
    help = 'Import data from tab-delimited file into the SingleModel model'

    
    def handle(self, *args, **kwargs):
        SingleModel.objects.all().delete()
        # Protein.objects.all().delete() #this will delete all other tables, as there are foreign keys
        file_path = "static/downloads/interface/v2h_binary_list_with_ires_iseq_category_seq_20231012.txt"
        dat = pd.read_csv(file_path,sep="\t").dropna()
        # with open(file_path, 'r') as file:
        #     csv_reader = csv.DictReader(file,delimiter='\t')
        cnt = 1
        for _,row in dat.iterrows():
                # break
            # try:
#                print(row['Human_protein_uid'])
                SingleModel.objects.create(
                    id = cnt,
                    prot=Protein.objects.get(id=row['Human_protein_uid']),
                    source='AlphaFold-Multimer',
                    file=row['HumanSingleFile'],
                    coverage=row['Human_ires_plddt'],
                    pdb_id = row['Human_SASA'],
                    chain = row['Human_dSASA'],
                    modbase_id = 'HUMAN (TaxID: 9606)',
                    sourcedisplay= f"{row['Viral_protein_uid']}_{row['Human_protein_uid']}_{row['Human_protein_uid']}",
                    res_range=f"[{row['Human_res_range']}]"
                )
                cnt = cnt+1
            # except:
            #     print(f"{row['Human_protein_uid']} is already in the database")
            # try:
                SingleModel.objects.create(
                    id = cnt,
                    prot=Protein.objects.get(id=row['Viral_protein_uid']),
                    source='AlphaFold-Multimer',
                    file=row['ViralSingleFile'],
                    coverage=row['Viral_ires_plddt'],
                    pdb_id = row['Viral_SASA'],
                    chain = row['Viral_dSASA'],
                    modbase_id = row['organism']+" (TaxID: "+ str(row['Viral_taxonomy_id'])+")",
                    sourcedisplay= f"{row['Viral_protein_uid']}_{row['Human_protein_uid']}_{row['Viral_protein_uid']}",
                    res_range=f"[{row['Viral_res_range']}]"
                )
                cnt = cnt + 1
            # except:
            #     print(f"{row['Viral_protein_uid']} is already in the database")
        self.stdout.write(self.style.SUCCESS('CSV data imported successfully.'))
