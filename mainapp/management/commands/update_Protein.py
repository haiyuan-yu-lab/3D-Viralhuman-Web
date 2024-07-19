# your_app_name/management/commands/import_csv.py
import csv
# import os
from django.core.management.base import BaseCommand
from django.db.models import Q
from mainapp.models import Protein
import pandas as pd

class Command(BaseCommand):
    help = 'Import data from tab-delimited file into the Protein model'

    
    def handle(self, *args, **kwargs):
        Protein.objects.all().delete() #this will delete all other tables, as there are foreign keys
        file_path = "static/downloads/interface/v2h_binary_list_with_ires_iseq_category_seq_20231012.txt"
        dat = pd.read_csv(file_path,sep="\t").dropna()

        # with open(file_path, 'r') as file:
        #     csv_reader = csv.DictReader(file,delimiter='\t')
        uid = set()
        for _,row in dat.iterrows():
                # break
#            try:
#                print(row)
                if not row['Human_protein_uid'] in uid:
                    uid.add(row['Human_protein_uid'])
                    Protein.objects.create(
                        id=row['Human_protein_uid'],
                        is_viral='No',
                        gene_name=row['Human_protein_name'],
                        protein_name_true=row['Human_recommended_protein_name'],
                        gene_name_true=row['Human_primary_gene_name'],
                        uniprot = row['Human_protein_uid'],
                        sequence = row['Human_seq'],
                        taxid = '9606',
                        length = len(row['Human_seq'])
                    )
#            except:
#                print(f"{row['Human_protein_uid']} is already in the database")
#            try:
                if not row['Viral_protein_uid'] in uid:
                    uid.add(row['Viral_protein_uid'])
                    Protein.objects.create(
                        id=row['Viral_protein_uid'],
                        is_viral='Yes',
                        gene_name=row['Viral_protein_name'],
                        protein_name_true=row['Viral_recommended_protein_name'],
                        gene_name_true=row['Viral_primary_gene_name'],
                        uniprot = row['Viral_protein_uid'],
                        sequence = row['Viral_seq'],
                        taxid = row['Viral_taxonomy_id'],
                       length = len(row['Viral_seq'])
                    )
#            except:
#                print(f"{row['Viral_protein_uid']} is already in the database")
        self.stdout.write(self.style.SUCCESS('CSV data imported successfully.'))
