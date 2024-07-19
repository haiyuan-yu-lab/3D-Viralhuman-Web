from django.urls import reverse
from django.shortcuts import render, loader
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db.models import Q
from .forms import UpdateVariablesForm
import re
from .models import *

def index(request):
    if re.findall(r'MSIE', request.META['HTTP_USER_AGENT']) or re.findall(r'Trident/7.0', request.META['HTTP_USER_AGENT']):
        return HttpResponse(loader.get_template('error.html').render())
    
    template = loader.get_template('index.html')
    human_info = list(Protein.objects.filter(is_viral='No').values())
    viral_info = list(Protein.objects.filter(is_viral='Yes').values())
    context = {
        'interactions': list(Interface.objects.values('p1', 'p2', 'source').distinct()),
        'human_info': human_info,
        'viral_info': viral_info
    }
    return HttpResponse(template.render(context=context))

def intsearch(request):
    viral_prot = request.GET.get('prot1')
    human_prot = request.GET.get('prot2')
    if viral_prot and human_prot:
        return HttpResponseRedirect(reverse('interaction', args=[f"{viral_prot}_{human_prot}"]))
    return HttpResponse(loader.get_template('error.html').render())

def singlesearch(request):
    prot = request.GET.get('prot', '')
    taxID = request.GET.get('taxID', '')
    return HttpResponseRedirect(reverse('inttable', args=[prot, taxID]))

def downloads(request):
    template = loader.get_template('downloads.html')
    return HttpResponse(template.render())

def about(request):
    template = loader.get_template('about.html')
    return HttpResponse(template.render())

#def inttable(request):
#    prot = request.GET.get('prot', '')
#    taxID = request.GET.get('taxID', '')
#    context = {}
#    if prot:
#        interactions = Interface.objects.filter(Q(p1__uniprot=prot) | Q(p2__uniprot=prot))
#        context['interactions'] = interactions
#    elif taxID:
#        viral_proteins = Protein.objects.filter(taxid=taxID)
#        interactions = Interface.objects.filter(Q(p1__in=viral_proteins) | Q(p2__in=viral_proteins))
#        context['interactions'] = interactions
#    else:
#        return HttpResponse(loader.get_template('error.html').render())
#    return render(request, 'inttable.html', context)


def inttable(request):
    prot = request.GET.get('prot', '')
    taxID = request.GET.get('taxID', '')
    context = {}
    interactions = []
    nodes = set()
    edges = []
    node_id = ''

    if prot:
        interactions = Interface.objects.filter(Q(p1__uniprot=prot) | Q(p2__uniprot=prot) | Q(p1__gene_name=prot) | Q(p2__gene_name=prot) | Q(p1__protein_name_true=prot) | Q(p2__protein_name_true=prot) | Q(p1__gene_name_true=prot) | Q(p2__gene_name_true=prot))
        context['interactions'] = interactions
        # Create nodes and edges for the subgraph
#        nodes = list(Protein.objects.filter(Q(uniprot=prot) | Q(itf_p1__p1__uniprot=prot) | Q(itf_p2__p2__uniprot=prot)).distinct().values('uniprot', 'gene_name'))
#        print(nodes)
#        nodes = list(Protein.objects.filter(Q(uniprot=prot) | Q(itf_p1__uniprot=prot) | Q(itf_p2__uniprot=prot)).distinct().values('uniprot', 'gene_name'))
#        edges = list(Interface.objects.filter(Q(p1__uniprot=prot) | Q(p2__uniprot=prot)).values('p1__uniprot', 'p2__uniprot'))
#        node_id = prot
        context['node_id'] = "with query protein: " + prot
    elif taxID:
        viral_proteins = Protein.objects.filter(taxid=taxID).values('id')
        interactions = Interface.objects.filter(Q(p1__in=viral_proteins) | Q(p2__in=viral_proteins))
        context['interactions'] = interactions
        # Create nodes and edges for the subgraph
#        nodes = list(Protein.objects.filter(Q(taxid=taxID) | Q(itf_p1__p1__taxid=taxID) | Q(itf_p2__p2__taxid=taxID)).distinct().values('uniprot', 'gene_name'))
#        edges = list(Interface.objects.filter(Q(p1__in=viral_proteins) | Q(p2__in=viral_proteins)).values('p1__uniprot', 'p2__uniprot'))
#        node_id = taxID
        context['node_id'] = "with query taxonomy: " + taxID
    else:
        return HttpResponse(loader.get_template('error.html').render())

    # Collect unique node IDs from interactions
    node_ids = set()
    for interaction in interactions:
        node_ids.add(interaction.p1_id)
        node_ids.add(interaction.p2_id)

    # Fetch node details from the database
    nodes = list(Protein.objects.filter(id__in=node_ids).values('uniprot', 'gene_name'))

    # Collect edges
    edges = list(interactions.values('p1__uniprot', 'p2__uniprot'))

    context['nodes'] = nodes
    context['edges'] = edges
#    context['node_id'] = node_id
#    print(nodes)
#    print(edges)
    
    return render(request, 'inttable.html', context)

def interaction(request, interaction):
    if re.findall(r'MSIE', request.META['HTTP_USER_AGENT']) or re.findall(r'Trident/7.0', request.META['HTTP_USER_AGENT']):
        return HttpResponse(loader.get_template('error.html').render())
    
    viral_prot, human_prot = interaction.split('_')
    viral_info = Protein.objects.filter(id=viral_prot, is_viral='Yes').values()[0]
    viral_info = {k: ('NaN' if v is None else v) for k, v in viral_info.items()}
    human_info = Protein.objects.filter(id=human_prot, is_viral='No').values()[0]
    human_info = {k: ('NaN' if v is None else v) for k, v in human_info.items()}
    
    viral_info.update(get_protein_details(f"{viral_prot}_{human_prot}_{viral_prot}"))
    human_info.update(get_protein_details(f"{viral_prot}_{human_prot}_{human_prot}"))
    
    score = round(DockedModel.objects.filter(p1=viral_prot, p2=human_prot).values()[0]["score"], 3)
    docked = list(DockedModel.objects.filter(p1=viral_prot, p2=human_prot).order_by('priority').values())
    human_single = list(SingleModel.objects.filter(sourcedisplay=f"{viral_prot}_{human_prot}_{human_prot}").values())
    viral_single = list(SingleModel.objects.filter(sourcedisplay=f"{viral_prot}_{human_prot}_{viral_prot}").values())
    
    if viral_single:
        viral_single = {k: ('NaN' if v is None else v) for k, v in viral_single[0].items()}
    else:
        viral_single = {}
    if human_single:
        human_single = {k: ('NaN' if v is None else v) for k, v in human_single[0].items()}
    else:
        human_single = {}

    itf_docking = list(Interface.objects.filter(p1=viral_prot, p2=human_prot))
    if itf_docking:
        itf_docking = itf_docking[0]
    else:
        itf_docking = {'p1_ires_as_list': [], 'p2_ires_as_list': []}

    itf_eclair = list(Interface.objects.filter(p1=viral_prot, p2=human_prot))
    if itf_eclair:
        itf_eclair = itf_eclair[0]
    else:
        itf_eclair = {'p1_ires_as_list': [], 'p2_ires_as_list': []}
    
    human_intsim = get_interface_similarities(viral_prot, human_prot, False)
    viral_intsim = get_interface_similarities(viral_prot, human_prot, True)
    
    viral_muts, popvars, viral_enrichment, human_enrichment, viral_domain, human_domain, ddg_summary, drugs = [], [], 'NaN', 'NaN', [], [], [], []
    sasa_thre, dsasa_thre = 15.0, 1.0
    if request.method == 'POST':
        form = UpdateVariablesForm(request.POST)
        if form.is_valid():
            sasa_thre = form.cleaned_data['sasa_thre']
            dsasa_thre = form.cleaned_data['dsasa_thre']

    
    context = {
        'viral_prot': viral_prot, 'human_prot': human_prot, 'viral_info': viral_info, 'human_info': human_info,
        'docked': docked, 'viral_single': viral_single, 'human_single': human_single, 'itf_docking': itf_docking,
        'itf_eclair': itf_eclair, 'viral_muts': viral_muts, 'popvars': popvars, 'viral_enrichment': viral_enrichment,
        'human_enrichment': human_enrichment, 'viral_domain': viral_domain, 'human_domain': human_domain,
        'ddg_summary': ddg_summary, 'drugs': drugs, 'viral_intsim': viral_intsim, 'human_intsim': human_intsim, 
        'model_score': score, 'sasa_thre': sasa_thre, 'dsasa_thre': dsasa_thre
    }
    context['viral_residues_range'] = list(range(viral_info['length']))
    context['human_residues_range'] = list(range(human_info['length']))
    return render(request, 'interaction.html', context)

def get_protein_details(sourcedisplay):
    details = {}
    res_range = SingleModel.objects.filter(sourcedisplay=sourcedisplay).values()[0]["res_range"]
    coverage = SingleModel.objects.filter(sourcedisplay=sourcedisplay).values()[0]["coverage"]
    pdb_id = SingleModel.objects.filter(sourcedisplay=sourcedisplay).values()[0]["pdb_id"]
    chain = SingleModel.objects.filter(sourcedisplay=sourcedisplay).values()[0]["chain"]
    details['res_range'] = [int(ele) for ele in res_range[1:-1].split(",")]
    details['plddt'] = [float(ele) for ele in coverage.split(",")]
    details['length'] = len(details['res_range'])
    details['SASA'] = [float(ele) for ele in pdb_id.split(",")]
    details['dSASA'] = [float(ele) for ele in chain.split(",")]
    return details

def get_interface_similarities(viral_prot, human_prot, is_viral):
    bm_ires = InterfaceSimilarity.objects.filter(p1=viral_prot, p2=human_prot, is_viral=is_viral).values()[0]["ires"]
    if is_viral:
        intsim = list(InterfaceSimilarity.objects.filter(
            Q(p1=viral_prot) & (~Q(p2=human_prot)) & Q(is_viral=is_viral)
        ).order_by('-similarity').values())
    else:
        intsim = list(InterfaceSimilarity.objects.filter(
            (~Q(p1=viral_prot)) & Q(p2=human_prot) & Q(is_viral=is_viral)
        ).order_by('-similarity').values())
    intsim = [InterfaceSimilarity.objects.filter(p1=viral_prot, p2=human_prot, is_viral=is_viral).values()[0]] + intsim
    for sim in intsim:
        if (bm_ires != "NaN") and (sim["ires"] != "NaN"):
            ires_lst_v = [int(ele) for ele in bm_ires.split(',')]
            ires_lst = [int(ele) for ele in sim["ires"].split(',')]
            sim["p2_name"] = str(round(sim["similarity"], 3))
            sim["similarity"] = (len(ires_lst_v) + len(ires_lst) - len(set(ires_lst_v + ires_lst))) / len(set(ires_lst_v + ires_lst))
        else:
            sim["p2_name"] = str(round(sim["similarity"], 3))
            sim["similarity"] = 0
        sim["web"] = sim["p1_id"] + "_" + sim["interactor"]
        sim["web_type"] = "INSIDER"
    return intsim
